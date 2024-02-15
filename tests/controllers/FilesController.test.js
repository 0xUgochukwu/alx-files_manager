/* eslint-disable */
import { expect } from "chai";
import { stub } from "sinon";
import FilesController from "../../controllers/FilesController";
import dbClient from "../../utils/db";
import redisClient from "../../utils/redis";
import { v4 as uuidv4 } from "uuid";
import { ObjectId } from "mongodb";

describe("FilesController", () => {
    it("postUpload", async () => {
        const request = {
        user: {
            _id: "5f1e7d35c7ba06511e683b21",
            email: "hewxx@xyz.co"
        },
        body: {
            name: "hello.txt",
            type: "text/plain",
            isPublic: true,
            parentId: "5f1e7d35c7ba06511e683b21",
        },
        file: {
            mimetype: "text/plain",
            path: "/tmp/hello.txt",
        },
        };
        const response = {
        status: stub().returnsThis(),
        json: stub(),
        };
        const dbClient = {
        findUser: stub().returns({ _id: "5f1e7d35c7ba06511e683b21" }),
        insertFile: stub().returns({ _id: "5f1e7d35c7ba06511e683b21" }),
        };
        const redisClient = {
        hset: stub().returns(1),
        };
        await FilesController.postUpload(request, response);
        expect(response.status.calledWith(201)).to.equal(true);
        expect(response.json.calledWith({ id: "5f1e7d35c7ba06511e683b21" })).to.equal(true);
        });
    }) 
