import {ApiInterface} from "./api/api-interface";
import {FakeApi} from "./api/fake-api";

export class Service {
  static API: ApiInterface;
  static init() {
    Service.API = new FakeApi();
  }
}
