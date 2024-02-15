/* eslint-disable */
import { expect } from "chai";
import { stub } from "sinon";
import AppController from "../../controllers/AppController";

describe("AppController", () => {
    it("getStatus", () => {
        const response = {
        status: stub().returnsThis(),
        send: stub(),
        };
        AppController.getStatus(null, response);
        expect(response.status.calledWith(200)).to.equal(true);
        expect(response.send.calledWith({ redis: true, db: true })).to.equal(true);
    });
    it("getStats", async () => {
        const response = {
        status: stub().returnsThis(),
        json: stub(),
        };
        const dbClient = {
        isAlive: stub().returns(true),
        nbUsers: stub().returns(0),
        nbFiles: stub().returns(0),
        };
        const redisClient = {
        isAlive: stub().returns(true),
        };
        await AppController.getStats({ db: dbClient, redis: redisClient }, response);
        expect(response.status.calledWith(200)).to.equal(true);
        expect(response.json.calledWith({ users: 0, files: 0 })).to.equal(true);
    });
})