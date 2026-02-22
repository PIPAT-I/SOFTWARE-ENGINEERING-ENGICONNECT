# ระบบสื่อสารและกระดานสนทนา (Engi Connect)



## Document
### สิ่งที่ต้องติดตั้งก่อนเริ่ม
* [Docker](https://www.docker.com/) 
* [Go](https://go.dev/doc/install) 
* [Node.js](https://nodejs.org/en/download)

### ขั้นตอนการใช้งาน
1. เริ่มเชื่อมต่อฐานข้อมูลโดย PostgreSQL ต่อเข้ากับ docker compose
```
docker compose up -d 
การตั้งค่า database อยู่ใน .env file 

```


2. การใช้งาน backend 
```
cd backend 
go run main.go
```
Backend จะ run ที่ `http://localhost:8080`

3. Run frontend 
```
cd frontend 
npm install
npm run dev
```
Frontend จะ run ที่  `http://localhost:5173`


### วิธีลบข้อมูล
1.ทำการหยุดและลบ containers:
```
docker compose down 

```
2.ลบvolume ทิ้ง 
```
docker compose down -v

```
### Tech
* **Backned** : Go
* **Frontend** : React + TypeScprit + Vite 
* **Database**: PostgreSQL 16
