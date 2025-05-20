<script context="module" lang="ts">
   declare global {
        interface Window {
            grecaptcha: {
                render: (container: string | HTMLElement, parameters: object) => number;
                reset: (opt_widget_id?: number) => void;
                getResponse: (opt_widget_id?: number) => string;
                execute: (opt_widget_id?: number) => void;
            },
            onCaptchaVerified: (token: string) => void;
             onCaptchaExpired: () => void;
        }
    }
</script>

<!-- <svelte:head>
 
<script src="https://www.google.com/recaptcha/api.js"
    async defer>
</script>
</svelte:head> -->
<script lang="ts">
    // declare global {
    //     interface Window {
    //         onCaptchaVerified: (token: string) => void;
    //         onRecaptchaLoaded: () => void;
    //         grecaptcha: any;
    //     }
    // }
  import Bounded from '$lib/components/Bounded.svelte';
	import Button from '$lib/components/Button.svelte';
	import Heading from '$lib/components/Heading.svelte';
	import type { Content } from '@prismicio/client';
	import { PrismicLink, PrismicRichText } from '@prismicio/svelte';
import PhoneCall from '~icons/ic/baseline-perm-phone-msg';
import Email from '~icons/ic/baseline-email';
import Location from '~icons/ic/baseline-location-on'
import { onMount } from 'svelte';
import emailjs from '@emailjs/browser';

 let recaptchaWidget: number;
  
//   onMount(() => {
//     // Define the callback for reCAPTCHA
//     window.onCaptchaVerified = (token: string) => {
//       recaptchaToken = token;
//       checkFormValidity();
//     };
    
//     // Add a script to load reCAPTCHA if it's not already loaded
//     if (!document.getElementById('recaptcha-script')) {
//       const script = document.createElement('script');
//       script.id = 'recaptcha-script';
//       script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoaded&render=explicit';
//       script.async = true;
//       script.defer = true;
//       document.head.appendChild(script);
      
//       // Define global callback for when reCAPTCHA loads
//       window.onRecaptchaLoaded = () => {
//         try {
//           recaptchaWidget = window.grecaptcha.render('recaptcha', {
//             'sitekey': SITE_KEY,
//             'callback': (token: string) => {
//               recaptchaToken = token;
//               checkFormValidity();
//             }
//           });
//         } catch (e) {
//           console.error('Error rendering reCAPTCHA:', e);
//         }
//       };
//     }
//   });
onMount(() => {
    console.log("Initial mount, loading reCAPTCHA");
    // Define the callback for reCAPTCHA that will be called when user checks the box
  window.onCaptchaVerified = (token: string) => {
    console.log("reCAPTCHA verified with token:", token);
    recaptchaToken = token;
    checkFormValidity();
  };

  // Add the expiration callback
    window.onCaptchaExpired = () => {
      console.log("reCAPTCHA verification expired");
      recaptchaToken = '';  // Clear the token
      checkFormValidity();  // Update form validity
    };

    // Add the script dynamically
    const script = document.createElement('script');
    script.src = "https://www.google.com/recaptcha/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log("reCAPTCHA script loaded");
    };
    document.head.appendChild(script);



    // Monitor for reCAPTCHA presence
    const checkInterval = setInterval(() => {
      console.log("Checking for reCAPTCHA...");
      if (window.grecaptcha && !document.querySelector('.g-recaptcha iframe')) {
        console.log("Found grecaptcha but no iframe, attempting to render");
        try {
          window.grecaptcha.render('recaptcha-container', {
            'sitekey': SITE_KEY
          });
          console.log("reCAPTCHA rendered");
          clearInterval(checkInterval);
        } catch (e) {
          console.log("reCAPTCHA render attempt failed:", e);
        }
      } else if (document.querySelector('.g-recaptcha iframe')) {
        console.log("reCAPTCHA iframe found, stopping checks");
        clearInterval(checkInterval);
      }
    }, 1000);

    // Clean up interval on component unmount
    return () => {
      clearInterval(checkInterval);
    };
  });

	export let slice: Content.ContactBlockSlice;

let formData = {
    firstName: '',
    lastName: '',
    email: '',
    message: '',
    service: '',
  };
 let status = { submitting: false, success: false, message: '' };

  const SITE_KEY = slice.primary.recaptcha_site_key!;

let isValid = false;
let isSending = false;
let recaptchaToken = '';
function checkFormValidity() {
  const hasName = formData.firstName.trim() !== '' && formData.lastName.trim() !== '';
  const hasEmail = formData.email.trim() !== '' && 
                  /^\S+@\S+\.\S+$/.test(formData.email); // Basic email validation
  const hasMessage = formData.message.trim() !== '';
  const hasRecaptcha = recaptchaToken !== '';
// const hasRecaptcha = true; // For testing purposes, always true
  
  isValid = hasName && hasEmail && hasMessage && hasRecaptcha;
  return isValid;
}

  const sendEmail = async(e: SubmitEvent) => {
    if(slice.primary.email_js_service_id === '' || slice.primary.email_js_template_id === '' || slice.primary.email_js_public_key === '') {
        console.error('EmailJS configuration is incomplete.');
    }
    e.preventDefault();

    // Get the reCAPTCHA response
  const recaptchaResponse = window.grecaptcha?.getResponse();
  
  if (!recaptchaResponse) {
    status.message = "Please check the reCAPTCHA box.";
    status.success = false;
    return;
  }
  
  if (!checkFormValidity()) {
    status.message = "Please complete all fields and verify the captcha.";
    status.success = false;
    return;
  }

    isSending = true;
  status.submitting = true;
  status.message = '';

  try {
    // Add the reCAPTCHA token to your form data
    const form = e.target as HTMLFormElement;
    const _formData = new FormData(form);
    
    // Create your temporary form as you were doing...
    const tempForm = document.createElement('form');
    
    // Copy all original form fields
    for (const [name, value] of _formData.entries()) {
      const input = document.createElement('input');
      input.name = name;
      input.value = value as string;
      input.type = 'hidden';
      tempForm.appendChild(input);
    }
    
    // Add the combined name field
    const nameInput = document.createElement('input');
    nameInput.name = 'name';
    nameInput.value = `${_formData.get('first_name')} ${_formData.get('last_name')}`;
    nameInput.type = 'hidden';
    tempForm.appendChild(nameInput);
    
    // Add the reCAPTCHA response
    const captchaInput = document.createElement('input');
    captchaInput.name = 'g-recaptcha-response';
    captchaInput.value = recaptchaResponse;
    captchaInput.type = 'hidden';
    tempForm.appendChild(captchaInput);
    
    // Send the email
    await emailjs.sendForm(
      slice.primary.email_js_service_id!, 
      slice.primary.email_js_template_id!, 
      tempForm, 
      {
        publicKey: slice.primary.email_js_public_key!
      }
    );
    
    console.log('SUCCESS!');
    status.success = true;
    status.message = 'Your message has been sent successfully!';
    
    // Reset the form and states
    formData = {
      firstName: '',
      lastName: '',
      email: '',
      message: '',
      service: ''
    };
    
    // Reset the actual form fields
    form.reset();
    
    // Reset reCAPTCHA
    window.grecaptcha.reset();
    
  } catch(error) {
    console.error('Error: ', error);
    status.success = false;
    status.message = 'There was an error sending your message. Please try again later.';
  } finally {
    status.submitting = false;
    isSending = false;
  }

//  try{
    // // Excute reCAPTCHA
    // await new Promise<void>((resolve)=>{
    //     window.grecaptcha.ready(async()=>{
    //         try{
    //             recaptchaToken = await window.grecaptcha.execute(SITE_KEY, {action: 'submit'});
    //             resolve();
    //         }catch(error){
    //             console.error('reCAPTCHA error:', error);
    //         status.message = "Could not verify you are human. Please try again.";
    //         status.success = false;
    //         isSending = false;
    //         status.submitting = false;
    //         }
    //     });
    // });

   
      // Check if the form is valid after getting the token
      	// Get the form element
//   const form = e.target as HTMLFormElement;
  
//   // Create FormData from the form
//   const _formData = new FormData(form);
  
//   // Add the combined name field (this won't modify the form)
//   const firstName = _formData.get('first_name') as string || '';
//   const lastName = _formData.get('last_name') as string || '';
  
//   // Create a temporary form element to send to EmailJS
//   const tempForm = document.createElement('form');
  
//   // Copy all original form fields
//   for (const [name, value] of _formData.entries()) {
//     const input = document.createElement('input');
//     input.name = name;
//     input.value = value as string;
//     input.type = 'hidden';
//     tempForm.appendChild(input);
//   }
  
//   // Add the combined name field
//   const nameInput = document.createElement('input');
//   nameInput.name = 'name';
//   nameInput.value = `${firstName} ${lastName}`;
//   nameInput.type = 'hidden';
//   tempForm.appendChild(nameInput);
   
//      emailjs
//     .sendForm(slice.primary.email_js_service_id!, slice.primary.email_js_template_id!, tempForm, {
//       publicKey: slice.primary.email_js_public_key!,
//     })
//     .then(
//       () => {
//         console.log('SUCCESS!');
//         status.success = true;
//         status.message = 'Your message has been sent successfully!';
        
//         // Reset the form and states
//         formData = {
//           firstName: '',
//           lastName: '',
//           email: '',
//           message: '',
//           service: ''
//         };
//         recaptchaToken = '';
        
//         // Reset the actual form fields
//         form.reset();
        
//         // If using grecaptcha, reset it
//         // if (window.grecaptcha) {
//         //   grecaptcha.reset(recaptchaWidget);
//         // }
//       },
//       (error) => {
//         console.log('FAILED...', error.text);
//         status.success = false;
//         status.message = 'Failed to send message. Please try again.';
//       },
//     )
//     .finally(() => {
//       status.submitting = false;
//       isSending = false;
//     });
   

//  }catch(error){
//      console.error('Error: ', error);
//      status.success = false;
//      status.message = 'There was an error sending your message. Please try again later.';
//  }finally{
//  }
  };

  $: {
    formData;  // React to changes in formData
    checkFormValidity();
  }
</script>
<!-- Add this -->
<svelte:window on:input={checkFormValidity} />
<Bounded data-slice-type={slice.slice_type} data-slice-variation={slice.variation}><div class="grid gap-8 md:grid-cols-2">
        <!-- Contact Info -->
        <div class="bg-slate-800 flex flex-col justify-between space-y-6 w-full p-8 rounded-xl shadow-lg text-white">
            <div class="flex flex-col justify-between">
                <Heading size="md" class="col-start-1">
                    {slice.primary.heading}
                </Heading>
                <div class="col-start-1 prose prose-invert prose-slate prose-xl">
                    <PrismicRichText field={slice.primary.subtitle} />
                </div>
                {#each slice.primary.contact_methods as item}
                    <div>
                        <div class="p-2 text-x1 text-slate-300 inline-flex justify-center sm:justify-start">
                            {#if item.contact_type === 'phone'} 
                                <PhoneCall class="inline-block mr-2" />
                            {:else if item.contact_type === 'email'}
                                <Email class="inline-block mr-2" />
                            {:else if item.contact_type === 'address'}
                                <Location class="inline-block mr-2" />
                            {:else}
                                <span class="inline-block mr-2">❓</span>
                            {/if}
                            <p>{item.value}</p>
                        </div>
                    </div>
                {/each}
            </div>
        </div>

        <!-- Email Form -->
        <div class="bg-slate-900 rounded-xl shadow-lg p-8">
            <form class="flex flex-col space-y-4" on:submit={(event)=>{
                // Prevent default form submission
                event.preventDefault();
                sendEmail(event);
            }} method="POST">
                
                <!-- names -->
                <div class="grid md:grid-cols-2 md:gap-6">
                    <div class="relative z-0 w-full mb-5 group">
                        <input bind:value={formData.firstName} on:input={checkFormValidity} type="text" name="first_name" id="floating_first_name" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                        <label for="floating_first_name" class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">First name</label>
                    </div>
                    <div class="relative z-0 w-full mb-5 group">
                        <input bind:value={formData.lastName} on:input={checkFormValidity} type="text" name="last_name" id="floating_last_name" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
                        <label for="floating_last_name" class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Last name</label>
                    </div>
                </div>

                <!-- Your email -->
                <label for="email-address-icon" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your Email</label>
                <div class="relative">
                    <div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                        <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 16">
                            <path d="m10.036 8.278 9.258-7.79A1.979 1.979 0 0 0 18 0H2A1.987 1.987 0 0 0 .641.541l9.395 7.737Z"/>
                            <path d="M11.241 9.817c-.36.275-.801.425-1.255.427-.428 0-.845-.138-1.187-.395L0 2.6V14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2.5l-8.759 7.317Z"/>
                        </svg>
                    </div>
                    <input bind:value={formData.email} on:input={checkFormValidity} type="email" name="user_email" id="email-address-icon" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="name@flowbite.com">
                </div>

                <!-- your message -->
                <label for="message" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your message</label>
                <textarea bind:value={formData.message} on:input={checkFormValidity} id="message" name="message" rows="4" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Leave a comment..."></textarea>

                <!-- Button Group -->
<div class="flex flex-wrap gap-2 rounded-md" role="group">
    {#each slice.primary.services as item, index}
        <button 
            type="button" 
            class="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 
            {index === 0 ? 'rounded-s-lg' : ''} 
            {index === slice.primary.services.length - 1 ? 'rounded-e-lg' : ''} 
            {formData.service === item.service_name ? 'bg-blue-200 dark:bg-blue-700' : ''}
            hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 
            focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white 
            dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 
            dark:focus:text-white"
            on:click={() => formData.service = item.service_name??''}>
            {item.service_name}
        </button>
    {/each}
</div>

<!-- Add a hidden input to include the selected service in the form submission -->
<input type="hidden" name="service" on:input={checkFormValidity} value={formData.service}>
<!-- ReCaptcha -->
				<div id="recaptcha-container" class="g-recaptcha flex justify-center my-4" data-sitekey={SITE_KEY} data-callback="onCaptchaVerified"
                data-expired-callback="onCaptchaExpired"
                ></div>
                <!-- <input type="hidden" name="reCaptchaToken" bind:value={recaptchaToken} /> -->

                <!-- Status message -->
{#if status.message}
  <div class="{status.success ? 'text-green-500' : 'text-red-500'} text-center">
    {status.message}
  </div>
{/if}

                <!-- Dynamic submit button -->
<div class="flex justify-center">
  {#if isSending}
    <!-- Loading state -->
    <button disabled type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center">
      <svg aria-hidden="true" role="status" class="inline w-4 h-4 me-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
      </svg>
      Loading...
    </button>
  {:else if !isValid}
    <!-- Disabled state -->
    <button type="button" class="text-white bg-blue-400 dark:bg-blue-500 cursor-not-allowed font-medium rounded-lg text-sm px-5 py-2.5 text-center" disabled>Submit</button>
  {:else}
    <!-- Active state -->
    <button type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Submit</button>
  {/if}
</div>
            </form>
        </div>
    </div>
		
<!-- <PrismicLink field={slice.primary.submit_action}>Link</PrismicLink> -->

</Bounded>
