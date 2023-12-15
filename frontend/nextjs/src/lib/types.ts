import { FirebaseError } from "firebase-admin";
import { UserCredential } from "firebase/auth";
import { Timestamp, FieldValue } from "firebase/firestore";
import { Type } from "lucide-react";
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

export enum POST_TYPES {
  Regular = 'regular',
  Question = 'question',
  Answer = 'answer',
}

export type PostVotes=  {
  upvotes: number;
  downvotes: number;
  userUpvoted?: boolean;
  userDownvoted?: boolean;
}

export interface Content {
  post: {
    title: string;
    body: string;
    imageURL?: String;
    owner: string;
    timestamp: Timestamp;
    id: string;
    tags?: string[];
    postType?: POST_TYPES;
  },
  metadata: PostVotes & {
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
  ownedExptIds?: number[];
  numFollowers?: number;
  numFollowing?: number;
  sessionStats?: {
    sessions: number;
    timeSpent: number;
  }
}

export type ProfileFilters = {
  ment?: 'asc' | 'desc',
  numFollowers?: 'asc' | 'desc',
  tags?: string[],
  level?: number,
  usernames?: string[],
  uids?: string[], 
  isFollowing?: boolean,
  isNotFollowing?: boolean,
}

export type ExptFilters = {
  //TODO: @Jovells refine this
  tags?: string[],
  author?: string,
  mentee?: string,
  tokenIds?: number[],
}
export type Coin = {
  name: string;
  address: string;
  decimals?: number;
  balance?: number;
  type: 'native' | 'erc721' | 'erc1155' | 'erc20';
}

export type userUpdateValidationResult = {
  email: boolean,
  username: boolean,
  [key: string]: boolean; 
}
export type PostFilters = {
  tags?: string[],
  owner?: string,
  isFollowing?: boolean,
}

export type ClaimHistoryItem ={
  id: string,
  type: 'ment' | 'expt',
  timestamp: Timestamp,
  amount: number,
  level?: number,
  uid: string,
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

export type Booking ={
  id: string;
  timestamp: Timestamp | FieldValue;
  message?: string;
  mentor: string;
  mentee: string;
  sessionTimestamp: string;
  sessionCount: number;
  exptListing?: ExptListingWithAuthorProfile;
  exptListingId: string;
  exptTokenId: string;
  isCompleted: boolean;
}

export type BookingFilters ={
  mentee?: string,
  mentor?: string,
  exptListingId?: string,
  exptTokenId?: string,
  isPast?: boolean,
  isUpcoming?: boolean,
  isCompleted?: boolean,
  tags?: string[],
}



export type NewExptListing = Omit<ExptListing, 'id' |'imageURL' | 'author' | 'remainingTokenIds'> & {coverImage?: File}

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