const PINATA_KEY = "2b7d84e293c95fbc51fb";
const PINATA_SECRET = "d29ef98751379a70ba0efb99310be5e3001a26ee204c18bf8d67d663e3fc298d";
const IPFS_LINK = "https://app.pinata.cloud/gateway/green-obliged-cicada-278/ipfs/" ;

const pinFileToIPFS = async (file, description) => {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

  let data = new FormData();
  data.append("file", file);

  const metadata = JSON.stringify({
    name: file.name,
    keyvalues: {
      name: file.name,
      description: description,
    },
  });

  data.append("pinataMetadata", metadata);

  try {
    const response = await axios.post(url, data, {
      // maxBodyLength: 600000000, //this is needed to prevent axios from erroring out with large files
      headers: {
        "Content-Type": `multipart/form-data;`,
        pinata_api_key: PINATA_KEY,
        pinata_secret_api_key: PINATA_SECRET,
      },
    });

    console.log("Uploaded", response);
    return response;
  } catch (error) {
    console.log("Error", error);
  }
};

const pinJSONToIPFS = async (JSONBody) => {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;

  let wrapJSON = {
    pinataContent: JSONBody,
  };

  try {
    const response = await axios.post(url, wrapJSON, {
      headers: {
        pinata_api_key: PINATA_KEY,
        pinata_secret_api_key: PINATA_SECRET,
      },
    });

    console.log("JSONToIPFS", response);

    return response;
  } catch (error) {
    console.log(error);
  }
};

export const uploadFileToPinata = async (file) => {
  if (!file) return "";

  try {
    let result = await pinFileToIPFS(file, "Express Demo");
    if (result.status === 200) {
      return `${IPFS_LINK}${result.data.IpfsHash}`;
    } else {
      return "";
    }
  } catch (err) {
    console.log(err);
    return "";
  }
};

export const uploadJSONToPinata = async (json) => {
  try {
    let result = await pinJSONToIPFS(json);
    if (result.status === 200) {
      return `${IPFS_LINK}${result.data.IpfsHash}`;
    } else {
      return "";
    }
  } catch (err) {
    console.log(err);
    return "";
  }
};