#!/usr/bin/env python3
"""
GitHub Branch Protection Script

This script applies branch protection rules to the repository based on the configuration
in .github/branch-protection.yml
"""
import os
import yaml
from github import Github

def load_config():
    """Load branch protection configuration from YAML file."""
    config_path = os.path.join('.github', 'branch-protection.yml')
    with open(config_path, 'r') as f:
        return yaml.safe_load(f)

def apply_branch_protection():
    """Apply branch protection rules to the repository."""
    # Initialize GitHub client
    g = Github(os.getenv('GITHUB_TOKEN'))
    
    # Get repository
    repo_name = os.getenv('GITHUB_REPOSITORY')
    repo = g.get_repo(repo_name)
    
    # Load protection rules
    config = load_config()
    
    # Apply rules to each branch
    for branch_pattern, rules in config.items():
        try:
            # Get the branch
            branch = repo.get_branch(branch_pattern)
            
            # Apply protection rules
            branch.edit_protection(
                # Required status checks
                enforce_admins=rules.get('enforce_admins', False),
                require_code_owner_reviews=rules.get('required_pull_request_reviews', {}).get('require_code_owner_reviews', False),
                required_approving_review_count=rules.get('required_pull_request_reviews', {}).get('required_approving_review_count', 0),
                dismiss_stale_reviews=rules.get('required_pull_request_reviews', {}).get('dismiss_stale_reviews', False),
                required_status_checks=rules.get('required_status_checks', {}).get('contexts', []),
                require_branches_to_be_up_to_date=rules.get('required_status_checks', {}).get('strict', True),
                # Restrictions
                user_push_restrictions=None,
                team_push_restrictions=None,
                # Other settings
                required_linear_history=rules.get('required_linear_history', False),
                allow_force_pushes=rules.get('allow_force_pushes', False),
                allow_deletions=rules.get('allow_deletions', False),
                block_creations=rules.get('block_creations', False),
                required_conversation_resolution=rules.get('required_conversation_resolution', False)
            )
            print(f"✅ Applied protection rules to {branch_pattern}")
            
        except Exception as e:
            print(f"⚠️ Failed to apply rules to {branch_pattern}: {str(e)}")

if __name__ == "__main__":
    apply_branch_protection()
