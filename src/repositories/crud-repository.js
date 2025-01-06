const mongoose = require("mongoose");

class CrudRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    try {
      const response = await this.model.create(data);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async get() {
    try {
      const response = await this.model.find({});
      return response;
    } catch (error) {
      throw error;
    }
  }

  async updateClientByPhoneNumberWithSession(phoneNumber, update, session) {
    if (phoneNumber.startsWith("+")) {
      phoneNumber = phoneNumber.substring(3);
    }
    try {
      const response = await this.model.findOneAndUpdate(
        { phoneNumber },
        update,
        { session, new: true }
      );
      console.log("data updated")
      console.log(update)
      console.log(phoneNumber)
      return response;
    } catch (error) {
      throw error;
    }
  }

  async update(id, data) {
    try {
      const response = await this.model.findByIdAndUpdate(id, data, {
        new: true,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CrudRepository;
