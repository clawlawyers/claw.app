const { Client } = require("../models");
const CrudRepository = require("./crud-repository");

class ClientRepository extends CrudRepository {
  constructor() {
    super(Client);
  }

  async getClientById(id) {
    try {
      const client = await Client.findById(id).exec();
      return client;
    } catch (error) {
      throw error;
    }
  }

  async getAllDetails() {
    try {
      const clients = await Client.find();
      return clients;
    } catch (error) {
      throw error;
    }
  }
  async getAll() {
    try {
      const clients = await Client.find().select("phoneNumber");
      return clients;
    } catch (error) {
      throw error;
    }
  }

  async getClientByPhoneNumberWithSession(phoneNumber, session) {
    if (phoneNumber.startsWith("+")) {
      phoneNumber = phoneNumber.substring(3);
    }
    // console.log(phoneNumber);

    try {
      const client = Client.findOne({ phoneNumber }).session(session);
      return client;
    } catch (error) {
      throw error;
    }
  }

  async getClientByPhoneNumbers(phoneNumbers) {
    try {
      const client = await Client.find({ phoneNumber: { $in: phoneNumbers } });
      return client;
    } catch (error) {
      throw error;
    }
  }

  async getClientByPhoneNumber(phoneNumber) {
    try {
      const client = await Client.findOne({ phoneNumber });
      return client;
    } catch (error) {
      throw error;
    }
  }

  async getClientByEmail(email) {
    try {
      const client = await Client.findOne({ email });
      return client;
    } catch (error) {
      throw error;
    }
  }

  async getClientByUsername(username) {
    try {
      const user = await Client.findOne({ username });
      return user;
    } catch (error) {
      throw error;
    }
  }

  async addPosttoClient(clientId, postId) {
    try {
      const response = await Client.findByIdAndUpdate(
        clientId,
        { $push: { posts: postId } },
        { new: true }
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  async deletePostfromClient(clientId, postId) {
    try {
      const response = await Client.findByIdAndUpdate(
        clientId,
        { $pull: { posts: postId } },
        { new: true }
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ClientRepository;
