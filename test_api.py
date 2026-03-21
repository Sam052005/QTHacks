import requests
import time

BASE_URL = "http://localhost:3001/api"

def test_api():
    print("Testing Backend API...")
    
    # 1. Create Simulation
    print("-> Creating Simulation (4-bit Shift Register)...")
    payload = {
        "circuitType": "SHIFT_REGISTER",
        "numFlipFlops": 4,
        "clockFrequency": 1.0,
        "inputSequence": [1, 0, 1, 1]
    }
    response = requests.post(f"{BASE_URL}/simulations", json=payload)
    if response.status_code != 201:
        print(f"Error creating simulation: {response.text}")
        return
    
    sim = response.json()
    sim_id = sim['id']
    print(f"   Created simulation with ID: {sim_id}")

    # 2. Run Batch Simulation
    print("-> Running Batch Simulation (10 cycles)...")
    run_payload = {
        "cycles": 10
    }
    response = requests.post(f"{BASE_URL}/simulations/{sim_id}/run", json=run_payload)
    if response.status_code != 200:
        print(f"Error running simulation: {response.text}")
        return
    print("   Simulation run complete.")

    # 3. Get Analysis
    print("-> Fetching Analytics...")
    response = requests.get(f"{BASE_URL}/simulations/{sim_id}/analysis")
    if response.status_code == 200:
         print(f"   Analytics: {response.json()}")

    # 4. Debug Breakpoints
    print("-> Testing Debug Engine (Continue until Cycle 15)...")
    debug_payload = {
        "breakpoints": [
            { "type": "CYCLE", "value": 15 }
        ],
        "maxCycles": 10
    }
    response = requests.post(f"{BASE_URL}/simulations/{sim_id}/debug/continue", json=debug_payload)
    if response.status_code == 200:
         res_data = response.json()
         print(f"   Debug execution hit breakpoint: {res_data.get('breakpointHit')}")

    print("All Backend tests executed successfully.")

if __name__ == "__main__":
    test_api()
