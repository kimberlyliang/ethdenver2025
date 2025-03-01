from web3 import Web3

# Connect to Ethereum RPC
web3 = Web3(Web3.HTTPProvider("https://quai.network"))

# Smart contract ABI & address
STORY_CONTRACT_ADDRESS = "0xYourStoryIntegrationContract"
STORY_ABI = [...]  # Import ABI from deployed contract

story_contract = web3.eth.contract(address=STORY_CONTRACT_ADDRESS, abi=STORY_ABI)

def verify_dataset(dataset_id, developer_address):
    """Checks if AI developer owns a valid dataset license."""
    
    dataset_info = story_contract.functions.datasets(dataset_id).call()
    dataset_ip_id = dataset_info[3]  # Story Protocol IP Asset ID
    license_terms_id = dataset_info[4]  # Required license terms

    # Check if developer has a valid dataset license
    owned_license = story_contract.functions.mintDatasetLicense(dataset_ip_id, license_terms_id).call({'from': developer_address})

    if owned_license:
        print(f"✅ Dataset {dataset_id} is licensed. Proceeding with AI training...")
        return True
    else:
        print(f"❌ License missing! AI model cannot train on dataset {dataset_id}.")
        return False