const frag = gql`
  fragment details on Author {
    firstName
    lastName
  }
`;

const query = gql`
  query firstQuery {
    author {
      ...details
    }
  }

  ${frag}
`;
