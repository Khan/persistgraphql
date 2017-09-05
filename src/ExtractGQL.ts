// This file implements the extractgql CLI tool.

import fs = require('fs');
import path = require('path');

import {
  parse,
  DocumentNode,
  OperationDefinitionNode,
  FragmentDefinitionNode,
  print,
  DefinitionNode,
  separateOperations,
} from 'graphql';

import {
  getOperationDefinitions,
  getFragmentNames,
  isFragmentDefinition,
  isOperationDefinition,
} from './extractFromAST';

import {
  findTaggedTemplateLiteralsInJS,
  eliminateInterpolations,
} from './extractFromJS';

import {
  getQueryKey,
  getQueryDocumentKey,
  sortFragmentsByName,
  applyQueryTransformers,
  TransformedQueryWithId,
  OutputMap,
  QueryTransformer,
} from './common';

import {
  addTypenameTransformer,
} from './queryTransformers';

import _ = require('lodash');

export type ExtractGQLOptions = {
  inputFilePath: string,
  outputFilePath?: string,
  queryTransformers?: QueryTransformer[],
  extensions?: string[],
  inJsCode?: boolean,
  excludePaths?: string[],
};

export enum PathType {
  DIRECTORY,
  FILE,
  SYMBOLIC_LINK
};

export class ExtractGQL {
  public inputFilePath: string;
  public outputFilePath: string;

  // Starting point for monotonically increasing query ids.
  public queryId: number = 0;

  // List of query transformers that a query is put through (left to right)
  // before being written as a transformedQuery within the OutputMap.
  public queryTransformers: QueryTransformer[] = [];

  // The file extensions to load queries from
  public extensions: string[] = [];

  // Whether to look for standalone .graphql files or template literals in JavaScript code
  public inJsCode: boolean = false;

  // The file paths to exclude
  public excludePaths: string[] = [];

  // The template literal tag for GraphQL queries in JS code
  public literalTag: string = 'gql';

  // Given a file path, this returns the extension of the file within the
  // file path.
  public static getFileExtension(filePath: string): string {
    const pieces = path.basename(filePath).split('.');
    if (pieces.length <= 1) {
      return '';
    }
    return pieces[pieces.length - 1];
  }

  // Reads a file into a string.
  public static readFile(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  // Checks if a given path points to a directory.
  public static pathType(path: string): Promise<PathType> {
    return new Promise<PathType>((resolve, reject) => {
      fs.lstat(path, (err, stats) => {
        if (err) {
          reject(err);
        } else {
          if (stats.isDirectory()) {
            resolve(PathType.DIRECTORY);
          } else if (stats.isSymbolicLink()) {
            resolve(PathType.SYMBOLIC_LINK);
          } else {
            resolve(PathType.FILE);
          }
        }
      });
    });
  }

  // Remove '/' after the path if it's present
  public static normalizePath(path: string): string {
    while (path.slice(-1) === '/') {
      path = path.slice(0, -1);
    }
    return path;
  }

  constructor({
    inputFilePath,
    outputFilePath = 'extracted_queries.json',
    queryTransformers = [],
    extensions = ['graphql'],
    inJsCode = false,
    excludePaths = [],
  }: ExtractGQLOptions) {
    this.inputFilePath = ExtractGQL.normalizePath(inputFilePath);
    this.outputFilePath = outputFilePath;
    this.queryTransformers = queryTransformers;
    this.extensions = extensions;
    this.inJsCode = inJsCode;

    
    for (var i = 0; i < excludePaths.length; i++) {
      excludePaths[i] = ExtractGQL.normalizePath(excludePaths[i]);
    }
    this.excludePaths = excludePaths;
  }

  // Add a query transformer to the end of the list of query transformers.
  public addQueryTransformer(queryTransformer: QueryTransformer) {
    this.queryTransformers.push(queryTransformer);
  }

  // Applies this.queryTransformers to a query document.
  public applyQueryTransformers(document: DocumentNode) {
    return applyQueryTransformers(document, this.queryTransformers);
  }

  // Just calls getQueryKey with this.queryTransformers as its set of
  // query transformers and returns a serialization of the query.
  public getQueryKey(definition: OperationDefinitionNode): string {
    return getQueryKey(definition, this.queryTransformers);
  }

  // Just calls getQueryDocumentKey with this.queryTransformers as its
  // set of query transformers and returns a serialization of the query.
  public getQueryDocumentKey(
    document: DocumentNode
  ): string {
    return getQueryDocumentKey(document, this.queryTransformers);
  }

  // Create an OutputMap from a GraphQL document that may contain
  // queries, mutations and fragments.
  public createMapFromDocument(document: DocumentNode): OutputMap {
    const transformedDocument = this.applyQueryTransformers(document);
    const queryDefinitions = getOperationDefinitions(transformedDocument);
    const result: OutputMap = {};
    queryDefinitions.forEach((transformedDefinition) => {
      const transformedQueryWithFragments = this.getQueryFragments(transformedDocument, transformedDefinition);
      transformedQueryWithFragments.definitions.unshift(transformedDefinition);
      const docQueryKey = this.getQueryDocumentKey(transformedQueryWithFragments);
      result[docQueryKey] = this.getQueryId();
    });
    return result;
  }

  // Given the path to a particular `.graphql` file, read it, extract the queries
  // and return the promise to an OutputMap. Used primarily for unit tests.
  public processGraphQLFile(graphQLFile: string): Promise<OutputMap> {
    return new Promise<OutputMap>((resolve, reject) => {
      ExtractGQL.readFile(graphQLFile).then((fileContents) => {
        const graphQLDocument = parse(fileContents);

        resolve(this.createMapFromDocument(graphQLDocument));
      }).catch((err) => {
        reject(err);
      });
    });
  }

  // Creates an OutputMap from an array of GraphQL documents read as strings.
  public createOutputMapFromString(docString: string): OutputMap {
    const doc = parse(docString);

    // Check for duplicate operation names. When `separateOperations` is called
    // below, it assumes that all operation names are unique; if duplicate
    // operation names exist, only one of those queries will appear in the
    // resulting map. So, we enforce that all query names are distinct to avoid
    // unexpected/surprising behavior.
    var operationNames = new Set<string>();
    var duplicates = new Set<string>();
    for (var i = 0; i < doc.definitions.length; i++) {
      const name = doc.definitions[i].name.value;
      if (operationNames.has(name)) {
        console.log('Duplicate operation name found: ' + name);
        duplicates.add(name);
      }
      operationNames.add(name);
    }

    // If there are duplicate operation names, raise an error and exit the process.
    if (duplicates.size !== 0) {
      var dupes = "";
      duplicates.forEach(function(name) {
        dupes += name + ", ";
      });
      dupes = dupes.substring(0, dupes.length - 2);
      console.log("Found the following duplicate GraphQL operation names: " + dupes);
      process.exit(1);
    }

    const docMap = separateOperations(doc);

    const resultMaps = Object.keys(docMap).map((operationName) => {
      const document = docMap[operationName];
      return this.createMapFromDocument(document);
    });

    return (_.merge({} as OutputMap, ...resultMaps) as OutputMap);
  }

  public readGraphQLFile(graphQLFile: string): Promise<string> {
    return ExtractGQL.readFile(graphQLFile);
  }

  public readInputFile(inputFile: string): Promise<string> {
    return Promise.resolve().then(() => {
      const extension = ExtractGQL.getFileExtension(inputFile);

      if (this.extensions.indexOf(extension) > -1) {
        if (this.inJsCode) {
          // Read from a JS file
          return ExtractGQL.readFile(inputFile).then((result) => {
            const literalContents = findTaggedTemplateLiteralsInJS(result, this.literalTag);
            const noInterps = literalContents.map(eliminateInterpolations);
            const joined = noInterps.join('\n');
            return joined;
          })
        } else {
          return this.readGraphQLFile(inputFile);
        }
      } else {
        return '';
      }
    });
  }

  // Processes an input path, which may be a path to a GraphQL file
  // or a directory containing GraphQL files. Creates an OutputMap
  // instance from these files.
  public processInputPath(inputPath: string): Promise<OutputMap> {
    return new Promise<OutputMap>((resolve, reject) => {
      this.readInputPath(inputPath).then((docString: string) => {
        resolve(this.createOutputMapFromString(docString));
      }).catch((err) => {
        reject(err);
      });
    });
  }

  public readInputPath(inputPath: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      ExtractGQL.pathType(inputPath).then((pathType) => {
        if (this.excludePaths.indexOf(inputPath) > -1) {
          console.log(`Excluding path ${inputPath}`);
          resolve('');
        } else if (pathType === PathType.SYMBOLIC_LINK) {
          // Ignoring symbolic links for now because we don't want to
          // attempt to read them as files. This assumes that linked 
          // files and directories are fine to ignore.
          // TODO(emilyling): Resolve symbolic links
          resolve('');
        } else if (pathType === PathType.DIRECTORY) {
          console.log(`Crawling ${inputPath}...`);
          // Recurse over the files within this directory.
          fs.readdir(inputPath, (err, items) => {
            if (err) {
              reject(err);
            }
            const promises: Promise<string>[] = items.map((item) => {
              return this.readInputPath(inputPath + '/' + item);
            });

            Promise.all(promises).then((queryStrings: string[]) => {
                resolve(queryStrings.reduce((x, y) => x + y, ""));
            });
          });
        } else {
          this.readInputFile(inputPath).then((result: string) => {
            resolve(result);
          }).catch((err) => {
            console.log(`Error occurred in processing path ${inputPath}: `);
            console.log(err.message);
            reject(err);
          });
        }
      });
    });
  }

  // Takes a document and a query definition contained within that document. Then, extracts
  // the fragments that the query depends on from the document and returns a document containing
  // only those fragments.
  public getQueryFragments(document: DocumentNode, queryDefinition: OperationDefinitionNode): DocumentNode {
    const queryFragmentNames = getFragmentNames(queryDefinition.selectionSet, document);
    const retDocument: DocumentNode = {
      kind: 'Document',
      definitions: [],
    };

    const reduceQueryDefinitions = (carry: FragmentDefinitionNode[], definition: DefinitionNode) => {
      const definitionName = (definition as (FragmentDefinitionNode | OperationDefinitionNode)).name;
      if ((isFragmentDefinition(definition) && queryFragmentNames[definitionName.value] === 1)) {
        const definitionExists = carry.findIndex(
          (value: FragmentDefinitionNode) => value.name.value === definitionName.value
        ) !== -1;

        // If this definition doesn't exist yet, add it.
        if (!definitionExists) {
          return [...carry, definition];
        }
      }

      return carry;
    };
    
    retDocument.definitions = document.definitions.reduce(
      reduceQueryDefinitions,
      ([] as FragmentDefinitionNode[])
    ).sort(sortFragmentsByName);
    
    return retDocument;
  }

  // Returns unique query ids.
  public getQueryId() {
    this.queryId += 1;
    return this.queryId;
  }

  // Writes an OutputMap to a given file path.
  public writeOutputMap(outputMap: OutputMap, outputFilePath: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      fs.open(outputFilePath, 'w+', (openErr, fd) => {
        if (openErr) { reject(openErr); }
        fs.write(fd, JSON.stringify(outputMap), (writeErr, written, str) => {
          if (writeErr) { reject(writeErr); }
          resolve();
        });
      });
    });
  }

  // Extracts GraphQL queries from this.inputFilePath and produces
  // an output JSON file in this.outputFilePath.
  public extract() {
    this.processInputPath(this.inputFilePath).then((outputMap: OutputMap) => {
      this.writeOutputMap(outputMap, this.outputFilePath).then(() => {
        console.log(`Wrote output file to ${this.outputFilePath}.`);
      }).catch((err) => {
        console.log(`Unable to process path ${this.outputFilePath}. Error message: `);
        console.log(`${err.message}`);
      });
    });
  }
}

// Type for the argument structure provided by the "yargs" library.
export interface YArgsv {
  _: string[];
  [ key: string ]: any;
}

// Main driving method for the command line tool
export const main = (argv: YArgsv) => {
  // These are the unhypenated arguments that yargs does not process
  // further.
  const args: string[] = argv._
  let inputFilePath: string;
  let outputFilePath: string;
  const queryTransformers: QueryTransformer[] = [];

  if (args.length < 1) {
    console.log('Usage: persistgraphql input_file [output_file]');
  } else if (args.length === 1) {
    inputFilePath = args[0];
  } else {
    inputFilePath = args[0];
    outputFilePath = args[1];
  }

  // Check if we are passed "--add_typename", if we are, we have to
  // apply the typename query transformer.
  if (argv['add_typename']) {
    console.log('Using the add-typename query transformer.');
    queryTransformers.push(addTypenameTransformer);
  }

  const options: ExtractGQLOptions = {
    inputFilePath,
    outputFilePath,
    queryTransformers,
  };

  if (argv['js']) {
    options.inJsCode = true;
  }

  if (argv['extension']) {
    options.extensions = argv['extension'].split(',');
  }

  if (argv['exclude']) {
    options.excludePaths = argv['exclude'].split(',');
  }

  new ExtractGQL(options).extract();
};
