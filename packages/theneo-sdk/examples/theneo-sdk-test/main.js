import {ImportOption, Theneo} from "@theneo/sdk";
import * as path from "path"

async function createProjectAndImport(apiKey) {
    const theneo = new Theneo({
        apiKey: apiKey || !process.env.THENEO_API_KEY,
    });

    const localFilePath = "petstore.yaml"

    let result = await theneo.createProject({
        name: "test-sdk",
        publish: true,
        data: {
            file: localFilePath
        }
    });

    if (result.err) {
        console.error("project creation errored", result.error.message)
        process.exit(1)
    }

    const project = result.unwrap();
    console.log("project created", project)


    const absoluteFilePath = path.join(process.cwd(), "petstore-expanded.yaml")
    console.log("absolute path", absoluteFilePath);
    const importResult = await theneo.importProjectDocument({
        projectId: project.projectId,
        importOption: ImportOption.OVERWRITE,
        publish: true,
        data: {
            file: absoluteFilePath,
        }
    });

    if (importResult.err) {
        console.log("error importing documentation", importResult.error.message);
        process.exit(1)
    }
    let data = importResult.unwrap();
    console.log("project imported successfully", data.publishData.publishedPageUrl);
}

createProjectAndImport().then(() => console.log("finished")).catch(console.error)
