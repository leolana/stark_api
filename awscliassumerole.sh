#!/usr/bin/env bash
unset  AWS_SESSION_TOKEN

temp_role=$(aws sts assume-role \
                    --role-arn "arn:aws:iam::251953125803:role/financeiro-organization" \
                    --role-session-name "circleci-alpe")

if [ -z "${temp_role}" ]
then
    echo "ASSUME ROLE ERROR"
    exit 1
fi

export AWS_ACCESS_KEY_ID=$(echo $temp_role | jq .Credentials.AccessKeyId | xargs)
export AWS_SECRET_ACCESS_KEY=$(echo $temp_role | jq .Credentials.SecretAccessKey | xargs)
export AWS_SESSION_TOKEN=$(echo $temp_role | jq .Credentials.SessionToken | xargs)