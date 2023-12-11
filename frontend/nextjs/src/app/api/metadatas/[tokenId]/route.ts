// import { firebase } from "@/lib/firebase";
import ExpertToken from "@/deployments/2359/ExpertToken";
import { ethers } from "ethers6";

const toposRpc = new ethers.JsonRpcProvider('https://rpc.topos-subnet.testnet-1.topos.technology/');
const expertToken = new ethers.Contract(ExpertToken.address, ExpertToken.abi, toposRpc)

export async function GET(
    request: Request,
    { params }: { params: { tokenId: number } }
) {
    // Attempt retrieving metadata from TokenListings collection
    const metadata = null;
    if (metadata) {
        return Response.json(metadata);
    } else {
        try {
            // Attempt to retrieve metadata from users collection
            const owner = await expertToken.ownerOf(params.tokenId);
            return Response.json({
                "name": "Expert Ticket",
                "description": "General Expert Ticket",
                "image": "https://source.unsplash.com/random/200x200?sig=1",
                "expiry": Date.now(),
                "duration": 60
            });
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