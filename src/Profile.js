import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Row, Form, Button, Card, ListGroup, Col } from "react-bootstrap";
import { create as ipfsHttpClient } from "ipfs-http-client";
import axios from "axios";
import { uploadFileToPinata } from "./Helper";
const client = ipfsHttpClient("https://api.pinata.cloud/pinning/pinFileToIPFS");
//const JWT =
//"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJhMWRlMjg2Zi1jNGZkLTQwZWYtOGUyZC00Y2Y1YjA5N2ExMTAiLCJlbWFpbCI6Imp5b3RpcmFnaGF2OTVAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjE2ZWI3OWQyNzA4YTQzM2FiYWE2Iiwic2NvcGVkS2V5U2VjcmV0IjoiOWQwODM0YjRlYWU4Y2Q1ODRjZTgxY2ViMWViYjQ1NWEwOTUyZDk1MjczZTQzMjU5NGYyNDQzMGNhZmFiZjlkOSIsImlhdCI6MTY5OTM1MzAxMH0.m1RnFFx_pyhK-DypQWy1Ff-PIF4Hx_d5TbVMcErlI-g";

const App = ({ contract, account }) => {
  const [profile, setProfile] = useState("");
  const [nfts, setNfts] = useState("");
  const [avatar, setAvatar] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const loadMyNFTs = async () => {
    // Get users nft ids
    const results = await contract.getMyNfts();
    // Fetch metadata of each nft and add that to nft object.
    let nfts = await Promise.all(
      results.map(async (i) => {
        // get uri url of nft
        const uri = await contract.tokenURI(i);
        // fetch nft metadata
        const response = await fetch(uri);
        const metadata = await response.json();
        return {
          id: i,
          username: metadata.username,
          avatar: metadata.avatar,
        };
      })
    );
    setNfts(nfts);
    getProfile(nfts);
  };
  const getProfile = async (nfts) => {
    const address = await contract.signer.getAddress();
    const id = await contract.profiles(address);
    const profile = nfts.find((i) => i.id.toString() === id.toString());
    setProfile(profile);
    setLoading(false);
  };
  const uploadToIPFS = async (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    uploadFileToPinata(file);
  };
  const mintProfile = async (event) => {
    console.log(avatar, username);
    if (!avatar || !username) return;
    try {
      const result = await client.add(JSON.stringify({ avatar, username }));
      setLoading(true);
      // await (await contract.mint(`https://ipfs.infura.io/ipfs/${result.path}`)).wait()
      loadMyNFTs();
    } catch (error) {
      window.alert("ipfs uri upload error: ", error);
    }
  };
  const switchProfile = async (nft) => {
    setLoading(true);
    await (await contract.setProfile(nft.id)).wait();
    getProfile(nfts);
  };
  useEffect(() => {
    if (!nfts) {
      loadMyNFTs();
    }
  });
  if (loading)
    return (
      <div className="text-center">
        <main style={{ padding: "1rem 0" }}>
          <h2>Loading...</h2>
        </main>
      </div>
    );
  return (
    <div className="mt-4 text-center">
      {profile ? (
        <div className="mb-3">
          <h3 className="mb-3">{profile.username}</h3>
          <img
            className="mb-3"
            style={{ width: "400px" }}
            src={profile.avatar}
          />
        </div>
      ) : (
        <h4 className="mb-4">No NFT profile, please create one...</h4>
      )}

      <div className="row">
        <main
          role="main"
          className="col-lg-12 mx-auto"
          style={{ maxWidth: "1000px" }}
        >
          <div className="content mx-auto">
            <Row className="g-4">
              <Form.Control
                type="file"
                required
                name="file"
                onChange={uploadToIPFS}
              />
              <Form.Control
                onChange={(e) => setUsername(e.target.value)}
                size="lg"
                required
                type="text"
                placeholder="Username"
              />
              <div className="d-grid px-0">
                <Button onClick={mintProfile} variant="primary" size="lg">
                  Mint NFT Profile
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
      <div className="px-5 container">
        <Row xs={1} md={2} lg={4} className="g-4 py-5">
          {nfts.map((nft, idx) => {
            if (nft.id === profile.id) return;
            return (
              <Col key={idx} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={nft.avatar} />
                  <Card.Body color="secondary">
                    <Card.Title>{nft.username}</Card.Title>
                  </Card.Body>
                  <Card.Footer>
                    <div className="d-grid">
                      <Button
                        onClick={() => switchProfile(nft)}
                        variant="primary"
                        size="lg"
                      >
                        Set as Profile
                      </Button>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>
    </div>
  );
};

export default App;
