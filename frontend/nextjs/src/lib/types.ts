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
    author: User
  }

  export 
  interface User {
    address: string;
    displayName?: string,
    email?: string;
    isAuthenticated?: boolean;
    photoURL?: string,
    tags?: string[];
    about?: string;
    isExpert?: boolean;
    skill?: string;
    username?: string
  }

  export type PostFilters = {
    tags?: string[],
    owner?: string,
    isFollowing?: boolean
  }