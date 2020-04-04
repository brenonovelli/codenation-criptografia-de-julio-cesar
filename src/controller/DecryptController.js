import "dotenv/config";
import request from "request";
import rp from "request-promise";
import sha1 from "js-sha1";
import fs from "fs";
import path from "path";
import { promisify } from "util";

class DecryptController {
  async store(req, res) {
    const jsonPath = path.resolve(__dirname, "..", "tmp", "anwser.json");

    const readFileAsync = promisify(fs.readFile);
    const writeFileAsync = promisify(fs.writeFile);

    const urlReq = `https://api.codenation.dev/v1/challenge/dev-ps/generate-data?token=${process.env.TOKEN}`;
    const urlSub = `https://api.codenation.dev/v1/challenge/dev-ps/submit-solution?token=${process.env.TOKEN}`;

    const sendJson = () => {
      // Async mode

      // let options = {
      //   method: "POST",
      //   uri: `https://api.codenation.dev/v1/challenge/dev-ps/submit-solution?token=${process.env.TOKEN}`,
      //   formData: {
      //     answer: {
      //       value: fs.createReadStream(jsonPath),
      //       options: {
      //         filename: "answer.json"
      //       }
      //     }
      //   }
      // };

      // try {
      //   await rp(options)
      //     .then(body => {
      //       console.log("passou 05");
      //       return res.json(
      //         `Sucesso. Json enviado com sucesso. O servidor respondeu: ${body}`
      //       );
      //     })
      //     .catch(err => {
      //       console.log("passou 06");
      //       return res.json(
      //         `Algo de errado aconteceu. O servidor respondeu: ${err}`
      //       );
      //     });
      // } catch (error) {
      //   console.log(error);
      // }

      const resquestConfig = request.post(urlSub, (err, httpResponse, body) => {
        if (err) {
          console.error(`Algo de errado aconteceu no upload ${err}`);
        }

        return res.json(
          `Sucesso. JSON enviado com sucesso. O servidor respondeu: ${body}`
        );
      });

      const form = resquestConfig.form();

      form.append("answer", fs.createReadStream(jsonPath), {
        filename: "answer.json"
      });
    };

    const handleJson = async () => {
      console.log("passou 01");

      const jsonData = await readFileAsync(jsonPath);
      const answer = JSON.parse(jsonData);

      console.log("passou 02");

      const decrypt = stringReceived => {
        let str = stringReceived
          .toLowerCase()
          .replace(/[a-z]/g, letter =>
            String.fromCharCode(letter.charCodeAt(0) - answer.numero_casas)
          );
        return str;
      };

      const decifrado = await decrypt(answer.cifrado);
      const resumo_criptografico = await sha1(decifrado);

      const newJson = JSON.stringify({
        ...answer,
        decifrado,
        resumo_criptografico
      });

      await writeFileAsync(jsonPath, newJson, "utf8", err => {
        if (err) {
          return console.log(
            `Algo de errado aconteceu ao salvar o JSON. ${err}`
          );
        }

        console.log("JSON salvo com sucesso.");

        sendJson();
      });
    };

    // Request JSON
    await rp(urlReq)
      .then(async res => {
        await writeFileAsync(jsonPath, res, "utf8", err => {
          if (err) {
            console.log(`Algo de errado aconteceu ao salvar o JSON. ${err}`);
          }
          console.log("JSON criado com sucesso.");

          handleJson();
        });
      })
      .catch(function(err) {
        console.log(err);
      });

    console.log("passou 08");
    return res.json("Nada aconteceu.");
  }
}

export default new DecryptController();

// // json data
// var jsonData = '{"persons":[{"name":"John","city":"New York"},{"name":"Phil","city":"Ohio"}]}';

// // parse json
// var jsonObj = JSON.parse(jsonData);
// console.log(jsonObj);

// // stringify JSON Object
// var jsonContent = JSON.stringify(jsonObj);
// console.log(jsonContent);

// fs.writeFile("output.json", jsonContent, 'utf8', function (err) {
//     if (err) {
//         console.log("An error occured while writing JSON Object to File.");
//         return console.log(err);
//     }

//     console.log("JSON file has been saved.");
// });
