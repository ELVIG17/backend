import bcrypt from "bcrypt";

export async function hashPass(pass: string): Promise<string> {
  return await bcrypt.hash(pass, 10);
}


export async function comparePass (plain:string, hash:string ) {
  return await bcrypt.compare(plain, hash)
  
}


