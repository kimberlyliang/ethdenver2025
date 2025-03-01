from web3 import Web3

import json
import os
from pathlib import Path

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Connect to Ethereum RPC (default to localhost if not specified)
RPC_URL = os.getenv('RPC_URL', 'http://localhost:8545')
try:
    web3 = Web3(Web3.HTTPProvider(RPC_URL))
    if not web3.is_connected():
        raise Exception(f"Failed to connect to {RPC_URL}")
except Exception as e:
    print(f"Error connecting to Ethereum node: {e}")
    exit(1)

# Load contract ABI from artifacts
try:
    artifacts_path = Path(__file__).parent.parent / "artifacts/contracts/StoryIntegration.sol/StoryIntegration.json"
    with open(artifacts_path) as f:
        contract_json = json.load(f)
        STORY_ABI = contract_json['abi']
except Exception as e:
    print(f"Error loading contract ABI: {e}")
    exit(1)

# Contract address should be in environment
STORY_CONTRACT_ADDRESS = os.getenv('STORY_CONTRACT_ADDRESS')
if not STORY_CONTRACT_ADDRESS:
    print("Error: STORY_CONTRACT_ADDRESS not set in environment")
    exit(1)

story_contract = web3.eth.contract(
    address=web3.to_checksum_address(STORY_CONTRACT_ADDRESS), 
    abi=STORY_ABI
)

def verify_dataset(dataset_id, developer_address):
    """Checks if AI developer owns a valid dataset license."""
    try:
        # Get dataset info
        dataset_info = story_contract.functions.datasets(dataset_id).call()
        dataset_ip_id = dataset_info[3]  # Story Protocol IP Asset ID
        license_terms_id = dataset_info[4]  # Required license terms

        # Build transaction to mint license
        tx = story_contract.functions.mintDatasetLicense(
            dataset_ip_id, 
            license_terms_id
        ).build_transaction({
            'from': developer_address,
            'gas': 300000,  # Estimate gas limit
            'nonce': web3.eth.get_transaction_count(developer_address)
        })

        print(f"Transaction ready for dataset {dataset_id}. Please sign and submit.")
        return tx
        
    except Exception as e:
        print(f"Error verifying dataset license: {e}")
        return None
