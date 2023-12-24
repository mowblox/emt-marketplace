// import { firebase } from "@/lib/firebase";
import ExpertToken from "@/deployments/2359/ExpertToken";
import { ethers } from "ethers6";
import { firestore } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, limit, query, where } from "firebase/firestore";

const toposRpc = new ethers.JsonRpcProvider('https://rpc.topos-subnet.testnet-1.topos.technology/');
const expertToken = new ethers.Contract(ExpertToken.address, ExpertToken.abi, toposRpc);

const exptListingsRef = process.env.NODE_ENV === "production" ? collection(firestore, "exptListings") : collection(firestore, "dev/jovells31337/exptListings");

export async function GET(
    request: Request,
    { params }: { params: { tokenId: number } }
) {
    // Attempt retrieving metadata from TokenListings collection
    const q = query(exptListingsRef, where("tokenIds", "array-contains", Number(params.tokenId)), limit(1));
    const querySnapshot = await getDocs(q);
    // console.log(querySnapshot.docs);
    if (!querySnapshot.empty) {
        // console.log(querySnapshot.docs[0].data());
        const data = querySnapshot.docs[0].data();
        return Response.json({
            "name": data.collectionName,
            "description": data.description,
            "image": data.imageURL,
            "expiry": data.timestamp.toMillis(),
            "duration": data.sessionDuration
        });
    } else {
        try {
            // Attempt to retrieve metadata from users collection
            const owner = await expertToken.ownerOf(params.tokenId);
            const docRef = doc(firestore, "users", owner);
            const docSnapshot = await getDoc(docRef);
            if (docSnapshot.exists()) {
                // console.log(docSnapshot.data());
                const data = docSnapshot.data();
                return Response.json({
                    "name": data.username,
                    "description": data.displayName,
                    "image": data.photoURL,
                    "expiry": Date.now(),
                    "duration": 60
                });
            } else {
                // Return generic metadata
                return Response.json({
                    "name": "Expert Ticket",
                    "description": "General Expert Ticket",
                    "image": "https://source.unsplash.com/random/200x200?sig=1",
                    "expiry": Date.now(),
                    "duration": 60
                });
            }
        } catch (error) {
            // Return generic metadata
            return Response.json({
                "name": "Expert Ticket",
                "description": "General Expert Ticket",
                "image": "https://source.unsplash.com/random/200x200?sig=1",
                "expiry": Date.now(),
                "duration": 60
            });
        }
    }
}