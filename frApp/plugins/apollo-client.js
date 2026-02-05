export default (context) => {
  
  return {
    httpEndpoint: process.env.HASURA_GRAPHQL_URL || 'http://localhost:5030/v1/graphql',
    httpLinkOptions: {
      credentials: 'same-origin'
    },
    // attach Authorization header from localStorage on client-side
    getAuth: () => {
      if (process.browser) {
        const token = localStorage.getItem('token');
        return token ? `Bearer ${token}` : '';
      }
      return '';
    }
  };
};
