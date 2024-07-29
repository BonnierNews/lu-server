export default function validateConfig(config) {
  const flattenedConfig = flattenObject(config);

  const invalidValues = Object.keys(flattenedConfig).filter((key) => {
    if (flattenedConfig[key] === "REPLACED_BY_ENV") {
      return true;
    }
    return false;
  });

  if (invalidValues.length !== 0) {
    throw new Error(`Invalid config for keys: ${invalidValues.join(", ")}`);
  }
}

function flattenObject(ob) {
  const result = {};
  for (const i in ob) {
    if ((typeof ob[i]) === "object" && !Array.isArray(ob[i])) {
      const temp = flattenObject(ob[i]);
      for (const j in temp) {
        result[`${i}.${j}`] = temp[j];
      }
    } else {
      result[i] = ob[i];
    }
  }
  return result;
}
