const fs = require('fs');
const path = require('path');

console.log('cwd', process.cwd(), 'dirname', __dirname)

const contractsDirectory = path.join(__dirname, '../artifacts/contracts');
console.log('contractsDirectory', contractsDirectory)

const generateAbis = (networkName, contractAddresses = {
    EMTMarketplace: "0x5FbDB2315678afecb367f032d93F642f64180aa3"
}) => {
    const outputDirectory = path.join(__dirname, '../../frontend/nextjs/src/deployments/'+networkName);
    fs.readdirSync(contractsDirectory).forEach((contractFolderName) => {
        const contractFilePath = path.join(contractsDirectory, contractFolderName);
        const contractName = contractFolderName.replace(".sol", "");

        if (fs.statSync(contractFilePath).isDirectory()) {

            const contractJsonPath = path.join(contractFilePath, contractName + ".json");

            if (fs.existsSync(contractJsonPath)) {
                const contractData = require(contractJsonPath);

                if (contractData && contractData.abi) {
                    const abiContent = JSON.stringify(contractData.abi, null, 2);
                    const outputFile = path.join(outputDirectory, `${contractName}.js`);

                    if (!fs.existsSync(outputDirectory)){
                        fs.mkdirSync(outputDirectory, { recursive: true });
                    }

                    fs.writeFileSync(outputFile, `export default {
${contractAddresses?.[contractName] ? 'address: ' + '"' + contractAddresses[contractName] + '",' : ""}
abi: ${abiContent}
};`, 'utf-8');
                    console.log(`Generated ${outputFile}`);
                } else {
                    console.error(`Contract JSON file for ${contractName} is missing ABI data.`);
                }
            } else {
                console.error(`JSON file for ${contractName} not found.`);
            }
        }
    });
};
module.exports = generateAbis;

// generateAbis();
