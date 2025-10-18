"""
LLM Service for generating test cases using OpenAI API
"""
import os
import json
from typing import List
from openai import OpenAI
from app.models.schemas import TestCase


class LLMService:
    """Service for interacting with LLM to generate test cases"""
    
    def __init__(self):
        """Initialize OpenAI client"""
        self.api_key = os.getenv("OPENAI_API_KEY", "")
        self.model = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
        self.client = None
        
        if self.api_key and self.api_key != "":
            try:
                self.client = OpenAI(api_key=self.api_key)
            except Exception as e:
                print(f"Failed to initialize OpenAI client: {e}")
    
    async def generate_test_cases(self, user_story: str, num_cases: int = 5) -> List[TestCase]:
        """
        Generate test cases from a user story using LLM
        
        Args:
            user_story: The user story to generate test cases from
            num_cases: Number of test cases to generate
            
        Returns:
            List of generated TestCase objects
        """
        # If OpenAI is not configured, return mock test cases
        if not self.client or not self.api_key:
            return self._generate_mock_test_cases(user_story, num_cases)
        
        try:
            prompt = self._create_prompt(user_story, num_cases)
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a QA expert who generates comprehensive test cases from user stories. Always respond with valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )
            
            content = response.choices[0].message.content
            test_cases_data = json.loads(content)
            
            # Convert to TestCase objects
            test_cases = []
            for tc_data in test_cases_data.get("test_cases", []):
                test_cases.append(TestCase(**tc_data))
            
            return test_cases[:num_cases]
            
        except Exception as e:
            print(f"Error generating test cases with LLM: {e}")
            # Fallback to mock test cases
            return self._generate_mock_test_cases(user_story, num_cases)
    
    def _create_prompt(self, user_story: str, num_cases: int) -> str:
        """Create prompt for LLM"""
        return f"""Generate {num_cases} comprehensive test cases for the following user story:

"{user_story}"

Return the test cases as a JSON object with the following structure:
{{
    "test_cases": [
        {{
            "title": "Test case title",
            "description": "What this test validates",
            "preconditions": ["Precondition 1", "Precondition 2"],
            "steps": ["Step 1", "Step 2", "Step 3"],
            "expected_result": "Expected outcome",
            "priority": "High|Medium|Low"
        }}
    ]
}}

Ensure test cases cover:
- Happy path scenarios
- Edge cases
- Error handling
- Different user roles if applicable
- Validation requirements

Return ONLY valid JSON, no additional text."""
    
    def _generate_mock_test_cases(self, user_story: str, num_cases: int) -> List[TestCase]:
        """
        Generate mock test cases when LLM is not available
        
        This is useful for development and testing without API keys
        """
        mock_cases = [
            TestCase(
                title="Happy Path - Successful Scenario",
                description=f"Verify the main functionality described in the user story works as expected",
                preconditions=[
                    "System is accessible",
                    "User has valid credentials (if applicable)",
                    "All required data is available"
                ],
                steps=[
                    "Navigate to the relevant page/feature",
                    "Execute the main action described in the user story",
                    "Verify the expected outcome",
                    "Check that no errors are displayed"
                ],
                expected_result="The functionality works as described in the user story without errors",
                priority="High"
            ),
            TestCase(
                title="Input Validation Test",
                description="Verify that input validation works correctly",
                preconditions=[
                    "System is accessible",
                    "Feature is available"
                ],
                steps=[
                    "Navigate to the relevant page",
                    "Attempt to submit with invalid data",
                    "Observe validation messages",
                    "Correct the data and submit"
                ],
                expected_result="System displays appropriate validation messages and prevents invalid submissions",
                priority="High"
            ),
            TestCase(
                title="Edge Case - Boundary Values",
                description="Test the system behavior with boundary values",
                preconditions=[
                    "System is accessible",
                    "Test data with boundary values is prepared"
                ],
                steps=[
                    "Identify minimum and maximum acceptable values",
                    "Test with values at boundaries",
                    "Test with values just outside boundaries",
                    "Verify system behavior"
                ],
                expected_result="System handles boundary values correctly and rejects invalid values",
                priority="Medium"
            ),
            TestCase(
                title="Error Handling Test",
                description="Verify proper error handling and user feedback",
                preconditions=[
                    "System is accessible",
                    "Error conditions can be triggered"
                ],
                steps=[
                    "Trigger an error condition",
                    "Observe error message display",
                    "Verify error is logged (if applicable)",
                    "Attempt recovery"
                ],
                expected_result="System displays user-friendly error messages and handles errors gracefully",
                priority="Medium"
            ),
            TestCase(
                title="User Experience Test",
                description="Verify the user experience meets requirements",
                preconditions=[
                    "System is accessible",
                    "Feature is implemented"
                ],
                steps=[
                    "Navigate through the user flow",
                    "Check UI/UX elements",
                    "Verify responsiveness",
                    "Test on different devices/browsers (if applicable)"
                ],
                expected_result="User interface is intuitive and provides a good user experience",
                priority="Low"
            )
        ]
        
        return mock_cases[:num_cases]
