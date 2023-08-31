import { DocumentNode, OperationDefinitionNode } from 'graphql';
import { OutputMap, QueryTransformer } from './common';
export type ExtractGQLOptions = {
    inputFilePath: string;
    outputFilePath?: string;
    queryTransformers?: QueryTransformer[];
    extensions?: string[];
    inJsCode?: boolean;
    excludePaths?: string[];
};
export declare enum PathType {
    DIRECTORY = 0,
    FILE = 1,
    SYMBOLIC_LINK = 2
}
export declare class ExtractGQL {
    inputFilePath: string;
    outputFilePath: string;
    queryId: number;
    queryTransformers: QueryTransformer[];
    extensions: string[];
    inJsCode: boolean;
    excludePaths: string[];
    literalTag: string;
    static getFileExtension(filePath: string): string;
    static readFile(filePath: string): Promise<string>;
    static pathType(path: string): Promise<PathType>;
    static normalizePath(path: string): string;
    constructor({ inputFilePath, outputFilePath, queryTransformers, extensions, inJsCode, excludePaths, }: ExtractGQLOptions);
    addQueryTransformer(queryTransformer: QueryTransformer): void;
    applyQueryTransformers(document: DocumentNode): DocumentNode;
    getQueryKey(definition: OperationDefinitionNode): string;
    getQueryDocumentKey(document: DocumentNode): string;
    createMapFromDocument(document: DocumentNode): OutputMap;
    processGraphQLFile(graphQLFile: string): Promise<OutputMap>;
    createOutputMapFromString(docString: string): OutputMap;
    readGraphQLFile(graphQLFile: string): Promise<string>;
    readInputFile(inputFile: string): Promise<string>;
    processInputPath(inputPath: string): Promise<OutputMap>;
    readInputPath(inputPath: string): Promise<string>;
    getQueryFragments(document: DocumentNode, queryDefinition: OperationDefinitionNode): DocumentNode;
    getQueryId(): number;
    writeOutputMap(outputMap: OutputMap, outputFilePath: string): Promise<void>;
    extract(): void;
}
export interface YArgsv {
    _: string[];
    [key: string]: any;
}
export declare const main: (argv: YArgsv) => void;
