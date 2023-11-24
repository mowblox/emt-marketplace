export interface Content {
    post:{
      title: string;
      body: string;
      imageURL?: String;
      owner: string;
      timestamp: number;
      id: string;
    },
    metadata: {
      upvotes: number;
      downvotes: number;
      id: string;
    },
    author: {
      displayName: string;
      address: string;
      photoURL: string;
      isExpert: boolean;
    }
  }

  export 
  interface User {
    address: string;
    displayName?: string,
    email?: string;
    isAuthenticated?: boolean;
    photoURL?: string,
    tags?: string[];
  }