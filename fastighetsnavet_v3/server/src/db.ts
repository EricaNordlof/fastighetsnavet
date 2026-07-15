import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";
fs.mkdirSync(path.resolve("data"),{recursive:true}); fs.mkdirSync(path.resolve("uploads"),{recursive:true});
export const db=new Database(path.resolve("data/fastighetsnavet.db")); db.pragma("foreign_keys=ON");
db.exec(`
CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,namn TEXT,epost TEXT UNIQUE,password_hash TEXT,roll TEXT);
CREATE TABLE IF NOT EXISTS fastigheter(id TEXT PRIMARY KEY,namn TEXT NOT NULL,adress TEXT NOT NULL,antal_lagenheter INTEGER DEFAULT 0,status TEXT DEFAULT 'Aktiv',anteckning TEXT DEFAULT '');
CREATE TABLE IF NOT EXISTS hyresgaster(id TEXT PRIMARY KEY,namn TEXT NOT NULL,lagenhet TEXT NOT NULL,telefon TEXT,epost TEXT,fastighet_id TEXT REFERENCES fastigheter(id) ON DELETE SET NULL);
CREATE TABLE IF NOT EXISTS felanmalningar(id TEXT PRIMARY KEY,rubrik TEXT NOT NULL,beskrivning TEXT DEFAULT '',fastighet_id TEXT REFERENCES fastigheter(id) ON DELETE SET NULL,hyresgast_id TEXT REFERENCES hyresgaster(id) ON DELETE SET NULL,prioritet TEXT DEFAULT 'Normal',status TEXT DEFAULT 'Ny',skapad TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS arbetsorder(id TEXT PRIMARY KEY,titel TEXT NOT NULL,beskrivning TEXT DEFAULT '',ansvarig TEXT,status TEXT DEFAULT 'Planerad',datum TEXT,felanmalan_id TEXT REFERENCES felanmalningar(id) ON DELETE SET NULL);
CREATE TABLE IF NOT EXISTS bilder(id TEXT PRIMARY KEY,felanmalan_id TEXT NOT NULL REFERENCES felanmalningar(id) ON DELETE CASCADE,filnamn TEXT,originalnamn TEXT,uppladdad TEXT);
`);
const c=(db.prepare("SELECT COUNT(*) c FROM users").get() as any).c;
if(!c){const q=db.prepare("INSERT INTO users VALUES(?,?,?,?,?)");q.run(crypto.randomUUID(),"Erica Admin","admin@fastighetsnavet.se",bcrypt.hashSync("Admin123!",10),"admin");q.run(crypto.randomUUID(),"Tekniker Test","tekniker@fastighetsnavet.se",bcrypt.hashSync("Teknik123!",10),"tekniker");}
const fc=(db.prepare("SELECT COUNT(*) c FROM fastigheter").get() as any).c;
if(!fc){const f1=crypto.randomUUID(),f2=crypto.randomUUID(),h1=crypto.randomUUID(),e1=crypto.randomUUID();db.prepare("INSERT INTO fastigheter VALUES(?,?,?,?,?,?)").run(f1,"Brf Solrosen","Solrosgatan 12, Malmö",24,"Aktiv","Innergård och cykelrum");db.prepare("INSERT INTO fastigheter VALUES(?,?,?,?,?,?)").run(f2,"Kvarteret Hamnen","Kajplatsen 4, Malmö",18,"Aktiv","Nyare fastighet");db.prepare("INSERT INTO hyresgaster VALUES(?,?,?,?,?,?)").run(h1,"Anna Svensson","A-1201","070-111 22 33","anna@example.se",f1);db.prepare("INSERT INTO felanmalningar VALUES(?,?,?,?,?,?,?,?)").run(e1,"Läckande kökskran","Kranen droppar kontinuerligt",f1,h1,"Hög","Ny","2026-07-15");db.prepare("INSERT INTO arbetsorder VALUES(?,?,?,?,?,?,?)").run(crypto.randomUUID(),"Byt blandare","Kontrollera och byt blandare","Erica","Planerad","2026-07-18",e1);}
