import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
// import { ethers } from "ethers";
// import contestJson from "../artifacts/contracts/contest.sol/Contest.json";

import { FileUpload } from "./FileUpload";
import StakeForm from "./StakeForm";

type EthereumAddress = `0x${string}`;

interface CompetitionDetailProps {
  walletAddress: EthereumAddress | "";
}

interface Competition {
  id: string;
  title: string;
  description: string;
  datasetLink: string;
  deadline: string;
  stakeAmount: string;
  owner: EthereumAddress;
}

interface FileMetadata {
  tokenId: string;
  ipId: string;
  licenseTermsId: string;
  ethStorageKey: string;
}

// Default data for development
const DEFAULT_COMPETITION: Competition = {
  id: "0x123",
  title: "ML Competition",
  description: "A competition to build machine learning models",
  datasetLink: "https://example.com/dataset",
  deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleString(),
  stakeAmount: "0.1",
  owner: "0x0000000000000000000000000000000000000000" as EthereumAddress
};

const CompetitionDetail: React.FC<CompetitionDetailProps> = ({ walletAddress }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [competition, setCompetition] = useState<Competition | null>(null);
  const [loading, setLoading] = useState(true);

  const [uploadedFile, setUploadedFile] = useState<{
    file: File | null;
    metadata?: FileMetadata;
  }>({ file: null });
  const [trainingFile, setTrainingFile] = useState<{
    file: File | null;
    metadata?: FileMetadata;
  }>({ file: null });
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContestDetails = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCompetition(DEFAULT_COMPETITION);
      } catch (err) {
        console.error("Error loading contest details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContestDetails();
  }, [id]);

  if (loading || !competition) {
    return <div>Loading competition...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        &larr; Back
      </button>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-3xl font-bold mb-4">{competition.title}</h2>
        <p className="mb-4">{competition.description}</p>
        <p className="mb-2">
          <span className="font-semibold">Deadline:</span> {competition.deadline}
        </p>
        <p className="mb-2">
          <span className="font-semibold">Dataset:</span>{" "}
          <a
            href={competition.datasetLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {competition.datasetLink}
          </a>
        </p>
        <p className="mb-4">
          <span className="font-semibold">Stake Required:</span> {competition.stakeAmount} Tokens
        </p>
        <p className="mb-4">
          <span className="font-semibold">Contest Owner:</span> {competition.owner}
        </p>

        <div className="mb-4">
          <label className="block font-semibold mb-1">Upload File (ipynb)</label>
          <FileUpload
            text="Upload ipynb File"
            accept=".ipynb"
            onFileSelect={(files: File[], metadata?: FileMetadata) => {
              setUploadedFile({
                file: files[0],
                metadata
              });
              setUploadError(null);
            }}
            description="Model implementation notebook"
          />
          {uploadError && (
            <div className="text-red-500 text-sm mt-2">{uploadError}</div>
          )}
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-1">Upload Training Data</label>
          <FileUpload
            text="Upload csv File"
            accept=".csv"
            onFileSelect={(files: File[], metadata?: FileMetadata) => {
              setTrainingFile({
                file: files[0],
                metadata
              });
              setUploadError(null);
            }}
            description="Training dataset"
          />
        </div>

        <StakeForm
          stakeAmount={parseFloat(competition.stakeAmount)}
          account={walletAddress as EthereumAddress}
          contestOwner={competition.owner}
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-2xl font-bold mb-4">Leaderboard</h3>
        <p>No leaderboard data available.</p>
      </div>
    </div>
  );
};

export default CompetitionDetail;
