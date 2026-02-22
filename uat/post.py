import time
import unittest
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

class ActivityManagerUAT(unittest.TestCase):

    def setUp(self):
        # 1. Config Driver
        self.driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
        self.driver.maximize_window()
        self.wait = WebDriverWait(self.driver, 30)
        self.actions = ActionChains(self.driver)
        
        self.login_url = "http://localhost:5173/login" 
        self.target_url = "http://localhost:5173/admin/events"

        self.login_process("A0000000", "adminpass123")
        self.force_navigate_to_events()

    def tearDown(self):
        print("จบการทำงาน... รอ 5 วินาที")
        time.sleep(2)
        self.driver.quit()

    def slow_down(self):
        time.sleep(2)

    def super_click(self, xpath_list, description):
        """ ฟังก์ชันกดปุ่มที่ทรงพลังที่สุด (รองรับทุกท่า) """
        print(f"กำลังหา: {description}")
        element = None
        
        for xpath in xpath_list:
            try:
                element = self.wait.until(EC.presence_of_element_located((By.XPATH, xpath)))
                break
            except:
                continue

        if not element:
            print(f"หา '{description}' ไม่เจอ (ข้าม)")
            return False

        # Scroll หา
        self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", element)
        time.sleep(1)

        try:

            self.driver.execute_script("arguments[0].click();", element)
            print(f"กด '{description}' ด้วย JS สำเร็จ")
        except:
            try:
 
                self.actions.move_to_element(element).click().perform()
                print(f"กด '{description}' ด้วย ActionChains สำเร็จ")
            except:

                element.click()
                print(f"กด '{description}' ด้วย Click ปกติ สำเร็จ")
        
        self.slow_down()
        return True

    def login_process(self, sut_id, password):
        self.driver.get(self.login_url)
        print("เริ่ม Login...")
        self.slow_down()

        # กรอก User
        try:
            user = self.wait.until(EC.presence_of_element_located((By.XPATH, "//input[@type='text' or contains(@name, 'id')]")))
            user.clear()
            user.send_keys(sut_id)
        except:
            pass

        # กรอก Pass
        try:
            pwd = self.driver.find_element(By.XPATH, "//input[@type='password']")
            pwd.clear()
            pwd.send_keys(password)
        except:
            pass

        # กด Login
        self.super_click([
            "//button[@type='submit']",
            "//*[contains(text(), 'Login')]",
            "//*[contains(text(), 'เข้าสู่ระบบ')]"
        ], "ปุ่ม Login")

        print("รอ 5 วินาที ให้ระบบจำ Session...")
        time.sleep(5)

    def force_navigate_to_events(self):
        """ ระบบนำทางแบบ Hybrid: ลองกดก่อน ถ้าไม่ได้ให้ Force URL """
        print("กำลังพยายามไปหน้าจัดการกิจกรรม...")
        

        clicked = self.super_click([
            "//span[contains(text(), 'จัดการกิจกรรม')]",
            "//div[contains(text(), 'จัดการกิจกรรม')]",
            "//li[contains(., 'จัดการกิจกรรม')]"
        ], "เมนูจัดการกิจกรรม")

       
        time.sleep(2)
        
        if "admin/events" in self.driver.current_url:
            print("ไปถึงหน้ากิจกรรมแล้ว (ด้วยการคลิก)")
        else:
            
            print("⚠️ คลิกแล้วยังไม่ไป -> ใช้ท่าไม้ตาย: Force URL Redirect")
            self.driver.get(self.target_url)
            
            try:
                self.wait.until(EC.presence_of_element_located((By.XPATH, "//button[contains(., 'สร้างกิจกรรมใหม่')]")))
                print("Force Redirect สำเร็จ! ถึงหน้ากิจกรรมแล้ว")
            except:
                print("Warning: ยังโหลดหน้าไม่เสร็จ หรือ URL ผิด")

    def get_test_image_path(self):
        path = os.path.abspath("test_image.jpg")
        if not os.path.exists(path):
            with open(path, "wb") as f:
                f.write(b"dummy content")
        return path

    def fill_input(self, element_id, value):
        """กรอกข้อมูลใน Input field"""
        try:
            element = self.wait.until(EC.presence_of_element_located((By.ID, element_id)))
            element.clear()
            element.send_keys(value)
            return True
        except Exception as e:
            print(f"ไม่สามารถกรอก {element_id}: {e}")
            return False

    def fill_datepicker(self, element_id, date_value):
        """กรอกข้อมูลใน Ant Design DatePicker"""
        try:
            # คลิกที่ DatePicker เพื่อเปิด
            picker = self.wait.until(EC.presence_of_element_located((By.ID, element_id)))
            picker.click()
            time.sleep(0.5)
            
            # Clear และกรอกค่าใหม่
            picker.clear()
            picker.send_keys(date_value)
            time.sleep(0.3)
            
            # กด Enter เพื่อยืนยัน
            picker.send_keys("\n")
            time.sleep(0.3)
            return True
        except Exception as e:
            print(f"ไม่สามารถกรอก DatePicker {element_id}: {e}")
            return False

    def fill_select(self, element_id, option_index=0):
        """เลือกค่าใน Ant Design Select dropdown"""
        try:
            # คลิกที่ Select เพื่อเปิด dropdown
            select_wrapper = self.wait.until(EC.presence_of_element_located(
                (By.XPATH, f"//div[contains(@class, 'ant-select')]//input[@id='{element_id}']/ancestor::div[contains(@class, 'ant-select')]")
            ))
            select_wrapper.click()
            time.sleep(0.5)
            
            # รอให้ dropdown เปิด แล้วเลือกตัวเลือก
            options = self.wait.until(EC.presence_of_all_elements_located(
                (By.CSS_SELECTOR, ".ant-select-dropdown .ant-select-item-option")
            ))
            if options and len(options) > option_index:
                options[option_index].click()
                time.sleep(0.3)
                return True
            else:
                print(f"ไม่พบตัวเลือกใน Select {element_id}")
                return False
        except Exception as e:
            print(f"ไม่สามารถเลือก Select {element_id}: {e}")
            return False

   
    # 1. Positive Case
    

    def test_positive_create_success(self):
        print("\nTest Case: Create Activity Success")
        
        # กดปุ่มสร้าง
        self.super_click([
            "//button[contains(., 'สร้างกิจกรรมใหม่')]",
            "//span[contains(., 'สร้างกิจกรรมใหม่')]"
        ], "ปุ่มสร้างกิจกรรมใหม่")

        # กรอกข้อมูล
        print("กรอกข้อมูล...")
        
        # ชื่อกิจกรรม
        self.fill_input("activityName", "UAT Final Event")
        
        # รายละเอียดกิจกรรม
        self.fill_input("description", "Test Description")
        
        # วันเริ่มต้นกิจกรรม (YYYY-MM-DD HH:mm)
        self.fill_datepicker("startDate", "2025-01-01 09:00")
        
        # วันสิ้นสุดกิจกรรม
        self.fill_datepicker("endDate", "2025-01-02 17:00")
        
        # วันเริ่มต้นลงทะเบียน
        self.fill_datepicker("regStartDate", "2025-01-01 09:00")
        
        # วันสิ้นสุดลงทะเบียน
        self.fill_datepicker("regEndDate", "2025-01-02 12:00")
        
        # ผู้จัดกิจกรรม
        self.fill_input("organizer", "Admin")
        
        # ประเภทกิจกรรม
        self.fill_input("type", "General")
        
        # สถานที่จัดกิจกรรม (Select dropdown)
        self.fill_select("location_id", 0)
        
        self.slow_down()

        # Upload รูปภาพ
        try:
            self.driver.find_element(By.CSS_SELECTOR, "input[type='file']").send_keys(self.get_test_image_path())
        except:
            pass

        # กดบันทึก
        self.super_click([
            "//button[contains(., 'บันทึก')]",
            "//button[@type='submit']"
        ], "ปุ่มบันทึก")

        # ตรวจสอบ
        time.sleep(2)
        if "UAT Final Event" in self.driver.page_source:
            print("Pass: สร้างสำเร็จ")
        else:
            self.fail("Failed: ไม่เจอข้อมูลที่สร้าง")

   
    #2. Negative Cases

    def test_negative_1_empty_submit(self):
        print("\nTest Case: Empty Submit")
        
        self.super_click(["//button[contains(., 'สร้างกิจกรรมใหม่')]"], "ปุ่มสร้าง")
        self.super_click(["//button[contains(., 'บันทึก')]"], "ปุ่มบันทึก (เปล่า)")

        try:
            errs = self.driver.find_elements(By.CLASS_NAME, "ant-form-item-explain-error")
            if len(errs) > 0:
                print(f"Pass: เจอ Error {len(errs)} จุด")
            else:
                self.fail("Failed: ไม่เจอ Error")
        except:
            self.fail("Failed: หา Element Error ไม่เจอ")

    def test_negative_2_missing_name(self):
        print("\nTest Case: Missing Name")
        
        self.super_click(["//button[contains(., 'สร้างกิจกรรมใหม่')]"], "ปุ่มสร้าง")
        
        # กรอกข้อมูลทุกช่องยกเว้นชื่อกิจกรรม
        self.fill_input("description", "No Name")
        self.fill_datepicker("startDate", "2025-01-01 09:00")
        self.fill_datepicker("endDate", "2025-01-02 17:00")
        self.fill_datepicker("regStartDate", "2025-01-01 09:00")
        self.fill_datepicker("regEndDate", "2025-01-02 12:00")
        self.fill_input("organizer", "Admin")
        self.fill_input("type", "Test")
        
        # เลือกสถานที่
        self.fill_select("location_id", 0)
        
        self.slow_down()

        self.super_click(["//button[contains(., 'บันทึก')]"], "ปุ่มบันทึก")

        try:
            errs = self.driver.find_elements(By.CLASS_NAME, "ant-form-item-explain-error")
            if len(errs) > 0:
                print(f"Pass: แจ้งเตือนถูกต้อง")
            else:
                self.fail("Failed: ไม่แจ้งเตือน")
        except:
             self.fail("Failed: ไม่เจอ Element Error")

    def test_negative_3_cancel_create(self):
        print("\nTest Case: Cancel Create")
        
        self.super_click(["//button[contains(., 'สร้างกิจกรรมใหม่')]"], "ปุ่มสร้าง")
        
        self.fill_input("activityName", "Cancel Me")
        self.slow_down()
        
        self.super_click(["//button[contains(., 'ยกเลิก')]"], "ปุ่มยกเลิก")

        if "Cancel Me" not in self.driver.page_source:
            print("Pass: ยกเลิกสำเร็จ")
        else:
            self.fail("Failed: ข้อมูลยังอยู่")

if __name__ == "__main__":
    unittest.main()