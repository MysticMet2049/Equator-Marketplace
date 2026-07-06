import http from "./httpClient";

export async function getCurrentCustomer() {
  return http.get("/api/customers/current");
}

const customerApi = {
  getCurrentCustomer,
};

export default customerApi;
