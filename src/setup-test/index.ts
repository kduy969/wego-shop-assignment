import { setupIntersectionObserverMock } from "./set-up-intersection-observer";
import setupApp from "../setup";
export default () => {
  setupApp();
  setupIntersectionObserverMock();
};
