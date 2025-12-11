import { msalInstance, loginRequest } from "../msalConfig";

export const ensureAccount = async () => {
  let account = msalInstance.getActiveAccount() || msalInstance.getAllAccounts()[0];
  if (!account) {
    const res = await msalInstance.loginPopup(loginRequest);
    account = res.account;
    msalInstance.setActiveAccount(account);
  }
  return account;
};

export const acquireToken = async () => {
  const account = await ensureAccount();
  try {
    const res = await msalInstance.acquireTokenSilent({ ...loginRequest, account });
    return res.accessToken;
  } catch {
    const res = await msalInstance.acquireTokenPopup(loginRequest);
    return res.accessToken;
  }
};

export const logout = () => msalInstance.logoutPopup();
