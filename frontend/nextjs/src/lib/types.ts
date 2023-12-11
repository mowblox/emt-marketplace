import { FirebaseError } from "firebase-admin";
import { UserCredential } from "firebase/auth";
import { Timestamp, FieldValue } from "firebase/firestore";
import { Session } from "next-auth";

export type SignUpData =
  { username?: string,
    usernameLowercase?: string; 
    email?: string,
    displayName?: string, 
    profilePicture?: File,
    photoURL?: string,
    tags?: string[]
    isComplete?: boolean,
   }

export type UserSession = Session & {firebaseToken?: string;
  isMultipleSignUpAttempt?: boolean
  isNotSignedUp?: boolean
  address?: string
  isNewUser?:boolean 
  error?: FirebaseError & {[key:string]: any}
  validateSignUpResult?: {email: boolean, username: boolean}
}


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
    sessionCount: number;
    sessionDuration: number;
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
  username?: string;
  ment?: number;
  numFollowers?: number;
  numFollowing?: number;
  sessionStats?: {
    sessions: number;
    timeSpent: number;
  }
}

export type ExptFilters = {
  //TODO: @Jovells refine this
  tags?: string[],
  owner?: string,
  isFollowing?: boolean,
  tokenIds?: number[],
}

export type PostFilters = {
  tags?: string[],
  owner?: string,
  isFollowing?: boolean,
}

export type ClaimHistoryItem ={
  type: 'ment' | 'expt',
  timestamp: Timestamp | FieldValue,
  amount: number,
  level?: number,
  uid?: string,
}

export type ExptListing = {
  id: string;
  price: number;
  paymentCurrency: string;
  collectionName: string;
  message?: string;
  collectionSize: number;
  tokenIds: number[];
  remainingTokenIds: number[];
  imageURL: string;
  title: string;
  description: string;
  sessionCount: number;
  sessionDuration: number;
  timestamp: Timestamp | FieldValue;
  author: string;
}
export type ExptListingWithAuthorProfile = ExptListing & {
  authorProfile : UserProfile;
  tokensOfCurrentUser?: number[];
}

export type NewExptListing = Omit<ExptListing, 'id' | 'title' |'imageURL' | 'author'> & {coverImage: File}

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