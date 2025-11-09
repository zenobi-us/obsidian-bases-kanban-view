declare const styles: string;
export default styles;

declare module '*.css?raw' {
  const styles: string;
  export default styles;
}
