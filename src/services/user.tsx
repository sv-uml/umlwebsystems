import * as React from "react";
import * as JwtDecode from "jwt-decode";
import axios from "axios";
import { AxiosResponse } from "axios";
import { configVals } from "./config";

interface authorizationHeader {
    headers: {
        Authorization: string
    }
}

export interface UserItem {
    id: string,
    firstName: string
    lastName: string
    email: string
}

export class UserService {

    /**
     * Submit email and password for user authentication.
     * @param email     Email to use for logging in.
     * @param password  Password to use for logging in.
     * @returns         Promise of type `AxiosResponse` containing the JWT authorization token.
     */
    public static async performLogin(email: string, password: string): Promise<AxiosResponse> {
        return axios.post(configVals.apiRoot + configVals.login, {
            auth: {
                "email": email,
                "password": password
            }
        });
    }

    /**
     * Get ID of currently logged-in user.
     * @returns         ID of currently logged-in user
     */
    public static getUserId(): string {
        return window.localStorage.getItem("user_id");
    }

    /**
     * Parse JWT authentication token and set ID of currently logged-in user.
     */
    private static setUserId(): void {
        var token: string = this.getToken();
        var decoded: { user_id: string } = JwtDecode(token);
        window.localStorage.setItem("user_id", decoded.user_id);
    }

    /**
     * Check if user is currently logged-in.
     * @returns         True if logged-in, false otherwise.
     */
    public static isLoggedIn(): boolean {
        return this.getUserId() != null;
    }

    /**
     * Get current JWT authorization token
     * @returns         JWT authorization token
     */
    public static getToken(): string {
        return window.localStorage.getItem("token");
    }

    /**
     * Save JWT authorization token into local storage.
     * @param token     JWT authorization token
     */
    public static saveToken(token: string): void {
        window.localStorage.setItem("token", token);
        this.setUserId();
    }

    /**
     * Get JWT token authorization-formatted header string.
     * @returns         Header object with formatted authorization string.
     */
    public static getAuthenticationHeader(): authorizationHeader {
        return {
            headers: {
                Authorization: `Bearer ${UserService.getToken()}`
            }
        }
    }

    /**
     * Retrieve information about a specific user.
     * @param id        Id of the user
     * @returns         `UserItem` object containing the user's first name, last name,
     *                  email and ID. If the user is not found or an error occurs,
     *                  a null object is returned.
     */
    public static async getUser(id: string): Promise<UserItem> {
        let item: UserItem = null;
        return axios.get(configVals.apiRoot + configVals.users + "/" + id, UserService.getAuthenticationHeader()).then(res => {
            if (res.data.length == 1) {
                item = {
                    id: id,
                    firstName: res.data[0].first_name,
                    lastName: res.data[0].last_name,
                    email: res.data[0].email
                }
                return item;
            }
        });
    }
}
