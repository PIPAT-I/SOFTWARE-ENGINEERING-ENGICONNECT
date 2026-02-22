from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from selenium.webdriver.common.keys import Keys
import time

# --- Setup ---
options = webdriver.EdgeOptions()
options.add_experimental_option("detach", True)
driver = webdriver.Edge(options=options)
wait = WebDriverWait(driver, 15)  # เพิ่มเวลารอเป็น 15 วินาที

def login(username, password):
    # เล็งไปที่หน้า Login (หรือถ้าโดน Redirect มา ก็เริ่มตรงนี้ได้เลย)
    print("Logging in...")
    
    # รอให้ช่อง Username ปรากฏ (สมมติ ID คือ username และ password)
    wait.until(EC.presence_of_element_located((By.ID, "username"))).send_keys(username)
    driver.find_element(By.ID, "password").send_keys(password)
    
    # กดปุ่ม Login
    driver.find_element(By.ID, "login-btn").click()
    
    # รอจนกว่า URL จะเปลี่ยนไปยังหน้าเป้าหมาย
    wait.until(EC.url_contains("/student/communication"))
    print("Login Successful!")
import os

# --- Helper Function: Create Dummy File ---
def create_dummy_file(filename, size_in_mb):
    with open(filename, "wb") as f:
        f.seek((size_in_mb * 1024 * 1024) - 1)
        f.write(b"\0")
    return os.path.abspath(filename)

# --- วิธีเรียกใช้ใน run_uat_tests ---
def run_uat_tests():
    print("="*60)
    print("Starting UAT Tests for Student Communication (Chat) Entity")
    print("="*60)
    
    # Prepare dummy files
    large_image_path = create_dummy_file("large_test_image.png", 6) # 6MB
    large_file_path = create_dummy_file("large_test_file.pdf", 11)  # 11MB
    print(f"[SETUP] Created dummy files: {large_image_path} (6MB), {large_file_path} (11MB)")

    try:
        # 1. Login
        print("\n[SETUP] Logging in...")
        driver.get("http://localhost:5173/login")
        wait.until(EC.presence_of_element_located((By.XPATH, "//input[@type='text' or @name='username' or @id='username']"))).send_keys("B6614690")
        
        password_field = driver.find_element(By.XPATH, "//input[@type='password']")
        password_field.send_keys("student123")
        
        login_btn = driver.find_element(By.XPATH, "//button[@type='submit' or contains(text(), 'เข้าสู่ระบบ')]")
        login_btn.click()
        print("[OK] Login submitted")
        
        # 2. Go to Communication Page
        print("\n[SETUP] Navigating to Communication Page...")
        time.sleep(2)
        driver.get("http://localhost:5173/student/communication")
        time.sleep(3)
        
        # 3. Ensure Room is Selected
        try:
            wait.until(EC.presence_of_element_located((By.XPATH, "//textarea[contains(@placeholder, 'ส่งข้อความ')]")))
        except TimeoutException:
            print("[INFO] Selecting first chat room...")
            room_items = driver.find_elements(By.XPATH, "//div[contains(@class, 'cursor-pointer')]//h3")
            if len(room_items) > 0:
                room_items[0].click()
                time.sleep(2)
            else:
                raise Exception("No chat rooms found!")

        message_box = wait.until(EC.presence_of_element_located((By.XPATH, "//textarea[contains(@placeholder, 'ส่งข้อความ')]")))
        submit_btn = driver.find_element(By.XPATH, "//button[@type='submit']")

        # ... (TEST CASES 1-4 SAME AS BEFORE) ...
        # =================================================================================
        # TEST CASE 1: Positive - Successful Message Submission
        # =================================================================================
        print("\n" + "="*50)
        print("TEST CASE 1 (Positive): Send Normal Message")
        print("="*50)
        try:
            test_msg = f"Hello UAT {int(time.time())}"
            # ... (Logic เดิม) ...
            message_box.clear()
            message_box.send_keys(test_msg)
            time.sleep(1)
            
            if submit_btn.is_enabled():
                submit_btn.click()
                time.sleep(2)
                if len(driver.find_elements(By.XPATH, f"//*[contains(text(), '{test_msg}')]")) > 0:
                     print(f"[PASS] ✓ Message '{test_msg}' appeared in chat.")
                else:
                     print(f"[FAIL] ✗ Message did not appear.")
            else:
                print("[FAIL] ✗ Submit button was disabled.")
        except Exception as e:
            print(f"[FAIL] ✗ Error: {e}")

        print("\n[INFO] Waiting 2 seconds before next test...")
        time.sleep(2)

        # =================================================================================
        # TEST CASE 2: Negative - Empty Input
        # =================================================================================
        print("\n" + "="*50)
        print("TEST CASE 2 (Negative): Empty Input Validation")
        print("="*50)
        try:
            message_box.clear()
            message_box.send_keys(Keys.CONTROL + "a")
            message_box.send_keys(Keys.DELETE)
            time.sleep(1)
            if not submit_btn.is_enabled():
                 print(f"[PASS] ✓ Button is disabled as expected.")
            else:
                 print(f"[FAIL] ✗ Button is ENABLED.")
        except Exception as e:
            print(f"[FAIL] ✗ Error: {e}")

        print("\n[INFO] Waiting 2 seconds before next test...")
        time.sleep(2)

        # =================================================================================
        # TEST CASE 3: Negative - Large Image Upload (>5MB)
        # =================================================================================
        print("\n" + "="*50)
        print("TEST CASE 3 (Negative): Large Image Upload (>5MB)")
        print("="*50)
        try:
            # Locate Image Input (Hidden) - Ref: accept="image/..."
            image_input = driver.find_element(By.XPATH, "//input[@accept='image/png, image/jpeg, image/gif']")
            
            # Send file path
            print(f"[STEP] Uploading 6MB Image...")
            image_input.send_keys(large_image_path)
            time.sleep(1)
            
            # Check for Alert (Frontend validation)
            try:
                alert = wait.until(EC.alert_is_present())
                alert_text = alert.text
                print(f"[INFO] Alert found: {alert_text}")
                
                if "5MB" in alert_text:
                    print(f"[PASS] ✓ System blocked large image with message: {alert_text}")
                    alert.accept()
                else:
                    print(f"[FAIL] ✗ Alert message incorrect: {alert_text}")
                    alert.accept()
            except TimeoutException:
                 print(f"[FAIL] ✗ No alert displayed for large image.")
        except Exception as e:
             print(f"[FAIL] ✗ Error: {e}")

        print("\n[INFO] Waiting 2 seconds before next test...")
        time.sleep(2)

        # =================================================================================
        # TEST CASE 4: Negative - Large File Upload (>10MB)
        # =================================================================================
        print("\n" + "="*50)
        print("TEST CASE 4 (Negative): Large File Upload (>10MB)")
        print("="*50)
        try:
            # Locate File Input (Hidden) - Ref: Not accept image
            # Finding the input that does NOT have accept attribute or is the second one
            file_inputs = driver.find_elements(By.XPATH, "//input[@type='file']")
            doc_input = None
            for inp in file_inputs:
                if not inp.get_attribute("accept"):
                    doc_input = inp
                    break
            
            if doc_input:
                print(f"[STEP] Uploading 11MB File...")
                doc_input.send_keys(large_file_path)
                time.sleep(1)
                
                # Check for Alert
                try:
                    alert = wait.until(EC.alert_is_present())
                    alert_text = alert.text
                    print(f"[INFO] Alert found: {alert_text}")
                    
                    if "10MB" in alert_text:
                        print(f"[PASS] ✓ System blocked large file with message: {alert_text}")
                        alert.accept()
                    else:
                        print(f"[FAIL] ✗ Alert message incorrect: {alert_text}")
                        alert.accept()
                except TimeoutException:
                     print(f"[FAIL] ✗ No alert displayed for large file.")
            else:
                print("[FAIL] ✗ Could not locate document upload input.")
        except Exception as e:
             print(f"[FAIL] ✗ Error: {e}")

    except Exception as e:
        print(f"\n[CRITICAL ERROR] Test suite failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        # Cleanup
        print("\n[CLEANUP] Removing dummy files...")
        if os.path.exists(large_image_path): os.remove(large_image_path)
        if os.path.exists(large_file_path): os.remove(large_file_path)
        
        print("\n" + "="*60)
        print("Summary: Tests Completed")
        print("="*60)
        # driver.quit()

if __name__ == "__main__":
    run_uat_tests()