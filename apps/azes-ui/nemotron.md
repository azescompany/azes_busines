invoke_url='https://integrate.api.nvidia.com/v1/chat/completions'

payload=$(cat <<'JSON'
{
"model": "nvidia/nemotron-3.5-super-vl-120b-a12b",
"messages": [{"role":"user","content":[{"type":"text","text":"Read the traffic sign in this image. What does it say, and what color is the sign?"},{"type":"image_url","image_url":{"url":"https://assets.ngc.nvidia.com/products/api-catalog/phi-3-5-vision/example1a.jpg"}}]}],
"temperature": 1,
"top_p": 0.95,
"max_tokens": 16384,

"parallel_tool_calls": true,

"seed": 42,
"chat_template_kwargs": {"enable_thinking":true},
"stream": true
}
JSON
)

printf 'header = "Authorization: Bearer %s"\n' "$NVIDIA_API_KEY" | \
curl --fail-with-body --config - -sS -N \
  --request POST \
  --url "$invoke_url" \
--header "Accept: application/json" \
--header "Content-Type: application/json" \
--data "$payload"
