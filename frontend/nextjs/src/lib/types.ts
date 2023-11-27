import { UserCredential } from "firebase/auth";
import { Timestamp } from "firebase/firestore";

export type SignUpData =
  { username?: string, 
    email?: string,
    displayName?: string, 
    profilePicture?: File,
    photoURL?: string,
    tags?: string[] }


export interface Content {
  post: {
    title: string;
    body: string;
    imageURL?: String;
    owner: string;
    timestamp: Timestamp;
    id: string;
  },
  metadata: {
    upvotes: number;
    downvotes: number;
    id: string;
  },
  author: UserProfile
}


export type  User = Partial<UserCredential["user"]> 

export type UserProfile ={
  uid: string,
  displayName?: string,
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