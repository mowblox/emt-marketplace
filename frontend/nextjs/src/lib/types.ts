import { UserCredential } from "firebase/auth";
import { Timestamp, FieldValue } from "firebase/firestore";

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

export interface ExpertTicket {
  price: number;
  paymentCurrency: string;
  metadata: {
    id: string;
    imageURL: string;
    title: string;
    description: string;
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
  level?: number;
  username?: string
  sessionStats?: {
    sessions: number;
    timeSpent: number;
  }
}

export type PostFilters = {
  tags?: string[],
  owner?: string,
  isFollowing?: boolean
}

export type NotificationData = {
  recipients: [string],
  sender: string,
  type: "upvote" | "downvote"  | "follow" ,
  contentId?: string,
  timestamp: FieldValue,
  isRead: boolean,
  optionalData?: {[key: string]: any}
}
export type NotificationFilters = {
  isRead?: boolean,
  sender: boolean,
}

export type BuiltNotification = {
  type: "upvote" | "downvote"  | "follow" ,
  contentId?: string,
  isNew: boolean,
  ids: string[];
  href: string;
  others: number;
  timestamp: Timestamp,
  datePublished: string,
  username: string,
  photoURL: string,
  sender: string,
  votes: number,
  message: string,
  summary: string,
}

export type ReviewItem = {
  user: UserProfile;
  content: {
    body: string;
    datePublished: string;
  }
}