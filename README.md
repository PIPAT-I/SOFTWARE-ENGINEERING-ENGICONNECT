# SE-TEAM-T21  ระบบสื่อสารและกระดานสนทนา (Engi Connect)
## สมาชิกและระบบที่รับผิดชอบ
<table border="1" style="border-collapse: collapse;border-radius: 10px;">
  <thead style = "color:black; text-align:center;">
    <tr>
        <th rowspan = "2">รหัสนักศึกษา</th>
        <th rowspan = "2">ชื่อ-นามสกุล</th>
        <th colspan ="2">ระบบย่อย</th>
    </tr>
    <tr>
        <th>ระบบย่อยที่1</th>
        <th>ระบบย่อยที่2</th>
    </tr>
  </thead>
  <tbody style="text-align:left;">
    <tr>
        <td>B6512866</td>
        <td>นายเจษฎา เชือดขุนทด</td>
        <td>ระบบคำร้องขอจัดตั้งทีมและโครงการ</td>
        <td>ระบบลงทะเบียนและจัดการทีม</td>
    </tr>
    <tr>
        <td>B6608347</td>
        <td>นางสาวอรปรียา แตงอ่อน</td>
        <td>ระบบประกาศผลและสรุปกิจกรรม</td>
        <td>ระบบสะสมคะแนน</td>
    </tr>
    <tr>
        <td>B6614690</td>
        <td>นายพิพัฒน์ อินสวรรค์</td>
        <td>ระบบโปรไฟล์ทักษะและความสนใจ</td>
        <td>ระบบประเมินและความคิดเห็นกิจกรรม</td>
    </tr>
     <tr>
        <td>B6614850</td>
        <td>นายเทพประทาน หลิน</td>
        <td>ระบบสื่อสารภายในกิจกรรม</td>
        <td>ระบบคลังผลงานนักศึกษา</td>
    </tr>
     <tr>
        <td>B6643508</td>
        <td>นางสาวนิรชา มนต์ธนอาสน์</td>
        <td>ระบบจัดการกิจกรรมและการแข่งขัน</td>
        <td>ระบบรับรองผลการเข้าร่วมกิจกรรม</td>
    </tr>    
  </tbody>
</table>


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