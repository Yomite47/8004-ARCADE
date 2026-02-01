const { PinataSDK } = require("pinata");

async function pin() {
    const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJhOTZiOWY5Mi01MjJmLTQxMzUtYjFjMi0xY2U5ZTc0MWNlNTIiLCJlbWFpbCI6Im9sYWZvbGFyaW40N0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiYTg0NmQ1YWI1NzFmNmY2YjFkMjciLCJzY29wZWRLZXlTZWNyZXQiOiI4NDRjODcwNmNiNDk5MTI5MTI5YzI2ZTFiZDc3ZTY4YjdmNTA3MGRiMWNiMTdhMWQ2M2Y1NDhjZmU0NzU1NWYzIiwiZXhwIjoxODAxNDc2NTY2fQ.hclBH5qvpeXK13Ctv4EyPATH5qJRSfY1WUpj3_oKjyE';
    
    const pinata = new PinataSDK({
        pinataJwt: JWT,
        pinataGateway: "gateway.pinata.cloud"
    });

    const cid = "bafybeifwkkb67q2jvfnd7mym4gnani4zq3abuowx2jjnqeojrrojo47dtu";
    
    console.log(`Pinning CID ${cid}...`);
    try {
        const result = await pinata.upload.public.cid(cid);
        console.log("Result:", result);
    } catch (error) {
        console.log("Error pinning CID:");
        console.log(error);
        if (error.message && error.message.includes("is not a function")) {
             console.log("Trying pinata.upload.cid...");
             try {
                const result2 = await pinata.upload.cid(cid);
                console.log("Result2:", result2);
             } catch(e2) {
                console.log(e2);
             }
        }
    }
}
pin();
