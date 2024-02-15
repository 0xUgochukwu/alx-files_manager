/* eslint-disable */
import { expect } from "chai";
import dbClient from "../../utils/db";


describe("DBClient", () => { 
  it("isAlive", () => {
    expect(dbclient.isAlive()).to.equal(true)
  })
  it("nbUsers", async () => {
    const nbUsers = await dbClient.nbUsers();
    expect(nbUsers).to.equal(0);
  })
  it("nbFiles", async () => {
    const nbFiles =  await dbClient.nbFiles();
    expect(nbFiles).to.equal(0);
  })
  it("findUser", async () => {
    const user = await dbClient.findUser({ email: "hello@hello.com"})
    expect(user).to.equal(null)
  })
    it("findFile", async () => {
        expect(await dbclient.findFile({ name: "hello.txt"})).to.equal(null)
    })
    it("findFiles", async () => {
        expect(await dbclient.findFiles({ _id: "5f1e7d35c7ba06511e683b21"}, 0, 10)).to.equal([])
    })
})