export const matchPath = (pattern) => {
  const keys = [];
  const regexString = pattern
    .split('/')
    .map((segment) => {
      if (segment.startsWith(':')) {
        keys.push(segment.slice(1));
        return '([^/]+)';
      }
      return segment;
    })
    .join('/');

  const regex = new RegExp(`^${regexString}$`);

  return (path) => {
    const match = path.match(regex);
    if (!match) return null;

    const params = {};
    keys.forEach((key, index) => {
      params[key] = match[index + 1];
    });

    return { params };
  };
};

export default matchPath;
