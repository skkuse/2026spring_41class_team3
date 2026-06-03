import os
import sys
import json
import random
from datetime import datetime
from dotenv import load_dotenv

# Add parent directory (AI/) to sys.path to import analyzer and evaluate
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

from analyzer import get_openai_response
from evaluate import evaluate_with_bert

# Load environment variables from .env file
load_dotenv(dotenv_path=os.path.join(parent_dir, ".env"))

def run_prompt_test(sample_size=20, target_folder="2~3sent"):
    test_data_dir = os.path.join(current_dir, "test_data", target_folder)
    results_dir = os.path.join(current_dir, "results")
    
    if not os.path.exists(test_data_dir):
        print(f"Error: Test data directory not found: {test_data_dir}")
        return
        
    if not os.path.exists(results_dir):
        os.makedirs(results_dir)
        
    # Gather JSON files from the target directory
    all_files = [f for f in os.listdir(test_data_dir) if f.endswith(".json")]
    if not all_files:
        print(f"Error: No JSON files found in {test_data_dir}")
        return
        
    # Randomly sample specified number of files (or all of them if less than sample_size)
    sampled_files = random.sample(all_files, min(sample_size, len(all_files)))
    print(f"Selected {len(sampled_files)} files for testing from {target_folder}.")
    
    test_results = []
    total_precision = 0.0
    total_recall = 0.0
    total_f1 = 0.0
    successful_calls = 0
    
    for idx, file_name in enumerate(sampled_files, start=1):
        file_path = os.path.join(test_data_dir, file_name)
        print(f"[{idx}/{len(sampled_files)}] Processing {file_name}...")
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            # Extract relevant fields
            meta_acq = data.get("Meta(Acqusition)", {})
            meta_ref = data.get("Meta(Refine)", {})
            annotation = data.get("Annotation", {})
            
            meeting_script = meta_ref.get("passage", "")
            doc_name = meta_acq.get("doc_name", "회의록")
            
            # Format inputs to match analyzer's schema
            test_input = {
                "meeting_script": meeting_script,
                "meeting_purpose": doc_name,
                "participants": "미지정",
                "prev_action_items": "없음",
                "prev_feedback": "없음"
            }
            
            # Call GPT API
            gpt_response = get_openai_response(test_input)
            
            # Call BERTScore Evaluation API
            # Matches existing evaluate_with_bert API using raw transcript and generated JSON
            bert_score = evaluate_with_bert(meeting_script, gpt_response)
            
            precision = bert_score.get("precision", 0.0)
            recall = bert_score.get("recall", 0.0)
            f1 = bert_score.get("f1", 0.0)
            
            total_precision += precision
            total_recall += recall
            total_f1 += f1
            successful_calls += 1
            
            # Record individual results
            test_results.append({
                "file_name": file_name,
                "input_script": meeting_script,
                "gold_summary1": annotation.get("summary1"),
                "gold_summary2": annotation.get("summary2"),
                "generated_output": gpt_response,
                "bert_score": {
                    "precision": precision,
                    "recall": recall,
                    "f1": f1
                }
            })
            print(f"    -> BERTScore F1: {f1:.4f} (P: {precision:.4f}, R: {recall:.4f})")
            
        except Exception as e:
            print(f"    -> Failed to process {file_name}: {e}")
            test_results.append({
                "file_name": file_name,
                "error": str(e)
            })
            
    # Calculate averages based on successful iterations
    avg_precision = total_precision / successful_calls if successful_calls > 0 else 0.0
    avg_recall = total_recall / successful_calls if successful_calls > 0 else 0.0
    avg_f1 = total_f1 / successful_calls if successful_calls > 0 else 0.0
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report = {
        "timestamp": datetime.now().isoformat(),
        "folder_tested": target_folder,
        "total_tested": len(sampled_files),
        "successful_calls": successful_calls,
        "average_scores": {
            "precision": avg_precision,
            "recall": avg_recall,
            "f1": avg_f1
        },
        "results": test_results
    }
    
    report_file_name = f"test_result_{timestamp}.json"
    report_file_path = os.path.join(results_dir, report_file_name)
    
    with open(report_file_path, 'w', encoding='utf-8') as rf:
        json.dump(report, rf, ensure_ascii=False, indent=2)
        
    print(f"\nTesting Completed!")
    print(f"Average Scores:")
    print(f"  - Precision: {avg_precision:.4f}")
    print(f"  - Recall:    {avg_recall:.4f}")
    print(f"  - F1 Score:  {avg_f1:.4f}")
    print(f"Report saved to: {report_file_path}")

if __name__ == "__main__":
    # Defaults to sampling size of 20 and folder '2~3sent'
    run_prompt_test(sample_size=20)
