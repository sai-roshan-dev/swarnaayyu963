import * as SecureStore from 'expo-secure-store';

const COUNTRY_KEY = 'user_country';

export async function setUserCountry(country: string) {
  await SecureStore.setItemAsync(COUNTRY_KEY, country);
}

export async function getUserCountry(): Promise<string | null> {
  return await SecureStore.getItemAsync(COUNTRY_KEY);
}
