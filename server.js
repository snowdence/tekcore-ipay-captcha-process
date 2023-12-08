import express from "express";
const app = express();
const port = 3000;
import NodeRSA from "node-rsa";
import qs from "qs";
import md5 from "md5";
import svg2img from "svg2img";

const key = new NodeRSA(
  "-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDLenQHmHpaqYX4IrRVM8H1uB21\nxWuY+clsvn79pMUYR2KwIEfeHcnZFFshjDs3D2ae4KprjkOFZPYzEWzakg2nOIUV\nWO+Q6RlAU1+1fxgTvEXi4z7yi+n0Zs0puOycrm8i67jsQfHi+HgdMxCaKzHvbECr\n+JWnLxnEl6615hEeMQIDAQAB\n-----END PUBLIC KEY-----"
);

let alphabeticalSort = (t, a) => {
  return t.localeCompare(a);
};

function genRequestId() {
  for (
    var t = "".concat("ABCDEFGHIJKLMNOPQRSTUVWXYZ").concat("0123456789"),
      a = "",
      r = 0;
    r < 12;
    r++
  )
    a += t[Math.floor(Math.random() * t.length)];
  return "".concat(a, "|").concat(new Date().getTime());
}

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

function prepareData(data, dataExtra) {
  let cloneData = data;
  cloneData.screenResolution = dataExtra.screenResolution || "2056x456";
  cloneData.browserInfo = dataExtra.browserInfo || "Chrome-119";
  cloneData.lang = dataExtra.lang || "vi";
  cloneData.requestId = genRequestId();
  cloneData.clientInfo =
    dataExtra.clientInfo || "125.212.220.35;Macintosh-10.157";

  let result = md5(
    qs.stringify(cloneData, {
      arrayFormat: "repeat",
      sort: alphabeticalSort,
    })
  );
  cloneData.signature = result;
  return cloneData;
}

app.post("/process-captcha-svg", (req, res) => {
  svg2img(req.body.html, function (error, buffer) {
    if (error) {
      console.error(error);
      res.json({
        success: false,
        data: null,
        message: "Thất bại",
      });
    }
    var base64data = new Buffer(buffer).toString("base64");
    res.json({
      success: true,
      data: base64data,
      message: "Thành công",
    });
  });
});

app.post("/encrypt", (req, res) => {
  // const key = new NodeRSA(
  //   "-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDLenQHmHpaqYX4IrRVM8H1uB21\nxWuY+clsvn79pMUYR2KwIEfeHcnZFFshjDs3D2ae4KprjkOFZPYzEWzakg2nOIUV\nWO+Q6RlAU1+1fxgTvEXi4z7yi+n0Zs0puOycrm8i67jsQfHi+HgdMxCaKzHvbECr\n+JWnLxnEl6615hEeMQIDAQAB\n-----END PUBLIC KEY-----"
  // );

  let bodyJson = req.body;
  let dataRaw = bodyJson["data_raw"] || {};
  let dataExtra = bodyJson["data_extra"] || {};

  let processedData = prepareData(dataRaw, dataExtra);

  console.log(processedData);
  const encrypted = key.encrypt(JSON.stringify(processedData), "base64");
  return res.json({
    encrypted: encrypted,
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Example app listening on port ${port}`);
});
