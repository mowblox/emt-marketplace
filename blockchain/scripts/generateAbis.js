const fs = require('fs');
const path = require('path');

const contractsDirectory = path.join(__dirname, '../artifacts/contracts');

const generateAbis = (chainId, contractAddresses) => {
    
    const outputDirectory = path.join(__dirname, '../../frontend/nextjs/src/deployments/'+chainId);
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
