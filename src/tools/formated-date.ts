export const getCurrentTimestamp = () => {
  const d = new Date();
  Date.now().toLocaleString();
  return `${d.getFullYear()}${(d.getMonth() + 1).toString().padStart(2, '0')}${d
    .getDate()
    .toString()
    .padStart(2, '0')}${d.getHours()}${d.getMinutes()}${d.getSeconds()}`;
};

export const getCurrentDate = () => {
  const d = new Date();
  Date.now().toLocaleString();
  return `${d.getFullYear()}${(d.getMonth() + 1).toString().padStart(2, '0')}${d
    .getDate()
    .toString()
    .padStart(2, '0')}`;
};

export const getCurrentTime = () => {
  const d = new Date();
  Date.now().toLocaleString();
  return `${d.getHours()}:${d.getMinutes()}.${d.getSeconds()}`;
};
