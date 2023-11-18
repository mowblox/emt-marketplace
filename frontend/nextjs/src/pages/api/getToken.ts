import type { NextApiRequest, NextApiResponse } from 'next';
import { FirebaseError } from 'firebase/app';
import { getSession } from "next-auth/react";


import * as admin from 'firebase-admin';
const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
);

function getApp() {
    let app;
    try {
        app = admin.initializeApp(
            {
                credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
            },
            'my-app',
        );
    } catch (error) {
        app = admin.app('my-app');
    }
    return app;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const auth = getApp().auth();

    const { address } = req.body;
    try {
        const session : any = await getSession({ req: { headers: req.headers } })

        console.log('ss', session, address );
        if (session?.address !== address) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const user = await auth.getUser(address).catch(
            async e => await auth.createUser({ uid: address })
        )
        console.log("2")


        const token = await auth.createCustomToken(address, {
            //... add other custom claims as need be
        });
        res.send({ token });
    } catch (error) {
        if (error instanceof FirebaseError) res.status(400).json({ message: error.message });
        else res.status(400).json({ message: error });
    }
};