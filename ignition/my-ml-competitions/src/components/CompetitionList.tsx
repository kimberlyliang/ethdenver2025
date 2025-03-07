import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";

// Update this address to the one where your ContestFactory is deployed.
const contestFactoryAddress = "0x23c8748F0c69076bf915e7203F4F7e732d60C46D";

// Minimal ABI for the ContestFactory contract.
const contestFactoryAbi = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "contestAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "ContestCreated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "contests",
    "outputs": [
      {
        "internalType": "contract Contest",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_datasetLink",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_description",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_deadline",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_stakeRequired",
        "type": "uint256"
      }
    ],
    "name": "createContest",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getContestsCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Minimal ABI for the Contest contract.
const contestAbi = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_datasetLink",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_description",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_deadline",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_stakeRequired",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_owner",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "ContestClosed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "submitter",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "NewSubmission",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "closeContest",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "contestClosed",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "datasetLink",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "deadline",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "description",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getSubmissionsCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "stakeRequired",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "submissions",
    "outputs": [
      {
        "internalType": "address",
        "name": "submitter",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "ipynbFile",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "trainingData",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "csvFile",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "ipynbFile",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "trainingData",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "csvFile",
        "type": "string"
      }
    ],
    "name": "submit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "title",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdrawFunds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const CompetitionList = () => {
  const navigate = useNavigate();
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        if (window.ethereum) {
          // Request account access if needed.
          await window.ethereum.request({ method: "eth_requestAccounts" });
          // For ethers v6, BrowserProvider is correct. Otherwise, consider using ethers.providers.Web3Provider.
          const provider = new ethers.BrowserProvider(window.ethereum);

          // Create a contract instance for the ContestFactory.
          const contestFactoryContract = new ethers.Contract(
            contestFactoryAddress,
            contestFactoryAbi,
            provider
          );

          // Get the number of contests.
          const count = await contestFactoryContract.getContestsCount();
          const countNumber = Number(count);
          console.log("Number of contests:", countNumber);

          // Fetch contest data concurrently.
          const comps = await Promise.all(
            Array.from({ length: countNumber }, async (_, i) => {
              const contestAddress = await contestFactoryContract.contests(i);
              console.log("Fetching contest at address:", contestAddress);

              // Create a contract instance for this contest.
              const contestContract = new ethers.Contract(
                contestAddress,
                contestAbi,
                provider
              );

              // Retrieve contest details.
              const title = await contestContract.title();
              const datasetLink = await contestContract.datasetLink();
              const description = await contestContract.description();
              const deadlineBN = await contestContract.deadline();
              const stakeRequiredBN = await contestContract.stakeRequired();

              // Format deadline as a local date string and stake using 18 decimals.
              const deadline = new Date(Number(deadlineBN) * 1000).toLocaleString();
              const stakeAmount = ethers.formatUnits(stakeRequiredBN, "ether");

              return {
                id: contestAddress,
                title,
                datasetLink,
                description,
                deadline,
                stakeAmount,
              };
            })
          );

          setCompetitions(comps);
        } else {
          console.error("Ethereum provider not found");
        }
      } catch (error) {
        console.error("Error fetching competitions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitions();
  }, []);

  if (loading) {
    return <div>Loading competitions...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-8">Active Competitions</h2>
      <div className="grid grid-cols-1 gap-6">
        {competitions.map((comp) => (
          <div
            key={comp.id}
            className="bg-white text-gray-800 rounded-lg shadow-lg p-6 transform transition hover:scale-105 hover:shadow-2xl"
          >
            <h3 className="text-2xl font-semibold mb-2">{comp.title}</h3>
            <p className="mb-2">{comp.description}</p>
            <p className="mb-2">
              <span className="font-semibold">Deadline:</span> {comp.deadline}
            </p>
            <p className="mb-4">
              <span className="font-semibold">Stake:</span> {comp.stakeAmount} Tokens
            </p>
            <button
              onClick={() => navigate(`competition/${comp.id}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompetitionList;
