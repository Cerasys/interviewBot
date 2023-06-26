// Expects express req object as paramter
const logHttpErrorPath = ({ originalUrl, method }: { originalUrl: string, method: string }) => `${method}: ${originalUrl}`;

export default logHttpErrorPath;